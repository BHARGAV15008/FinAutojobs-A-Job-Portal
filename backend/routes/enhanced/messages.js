import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../../models/Message.js';
import { BaseUser } from '../../models/UserModels.js';
import { authenticateToken } from '../../middleware/auth.js';
import { sendNotification } from '../../services/enhanced/notificationService.js';

const router = express.Router();

// Validation schemas
const messageValidation = [
  body('recipientId')
    .isMongoId()
    .withMessage('Valid recipient ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject must not exceed 200 characters'),
];

const conversationValidation = [
  body('participantId')
    .isMongoId()
    .withMessage('Valid participant ID is required'),
];

// @route   POST /api/messages/conversation
// @desc    Create or get existing conversation
// @access  Private
router.post('/conversation', authenticateToken, conversationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { participantId } = req.body;
    const userId = req.user.userId;

    // Prevent creating conversation with self
    if (participantId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if participant exists
    const participant = await BaseUser.findById(participantId).select('firstName lastName email role');
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Find existing conversation
    let conversation = await Message.findOne({
      $or: [
        { senderId: userId, recipientId: participantId },
        { senderId: participantId, recipientId: userId }
      ]
    }).sort({ createdAt: -1 });

    if (!conversation) {
      // Create initial conversation placeholder
      conversation = new Message({
        senderId: userId,
        recipientId: participantId,
        content: '',
        messageType: 'system',
        status: 'conversation_created'
      });
      await conversation.save();
    }

    // Get conversation ID (using a combination of user IDs)
    const conversationId = [userId, participantId].sort().join('-');

    // Get recent messages in this conversation
    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: participantId },
        { senderId: participantId, recipientId: userId }
      ],
      messageType: { $ne: 'system' }
    })
    .populate('senderId', 'firstName lastName profilePicture')
    .populate('recipientId', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: {
        conversationId,
        participant,
        messages: messages.reverse(), // Show oldest first
        unreadCount: messages.filter(msg => 
          msg.recipientId._id.toString() === userId && msg.status === 'sent'
        ).length
      }
    });

  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for user
// @access  Private
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    // Get all conversations (latest message per conversation)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { recipientId: userId }
          ],
          messageType: { $ne: 'system' }
        }
      },
      {
        $addFields: {
          otherParticipant: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$recipientId',
              '$senderId'
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherParticipant',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipientId', userId] },
                    { $eq: ['$status', 'sent'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'baseusers',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          participant: {
            _id: '$participant._id',
            firstName: '$participant.firstName',
            lastName: '$participant.lastName',
            email: '$participant.email',
            role: '$participant.role',
            profilePicture: '$participant.profilePicture'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt',
            senderId: '$lastMessage.senderId',
            status: '$lastMessage.status'
          },
          unreadCount: 1,
          conversationId: {
            $concat: [
              { $toString: { $min: [userId, '$_id'] } },
              '-',
              { $toString: { $max: [userId, '$_id'] } }
            ]
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit)
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Get total conversations count
    const totalConversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { recipientId: userId }
          ],
          messageType: { $ne: 'system' }
        }
      },
      {
        $addFields: {
          otherParticipant: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$recipientId',
              '$senderId'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$otherParticipant'
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalConversations[0]?.total || 0;

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalConversations: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Get messages in a conversation
// @access  Private
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;

    // Parse conversation ID to get participant IDs
    const [participant1, participant2] = conversationId.split('-');
    
    if (![participant1, participant2].includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const otherParticipantId = participant1 === userId ? participant2 : participant1;

    // Get messages
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: otherParticipantId },
        { senderId: otherParticipantId, recipientId: userId }
      ],
      messageType: { $ne: 'system' }
    })
    .populate('senderId', 'firstName lastName profilePicture')
    .populate('recipientId', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: otherParticipantId,
        recipientId: userId,
        status: 'sent'
      },
      { status: 'read', readAt: new Date() }
    );

    // Get total messages count
    const totalMessages = await Message.countDocuments({
      $or: [
        { senderId: userId, recipientId: otherParticipantId },
        { senderId: otherParticipantId, recipientId: userId }
      ],
      messageType: { $ne: 'system' }
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / parseInt(limit)),
          totalMessages,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', authenticateToken, messageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recipientId, content, subject, messageType = 'text', attachments } = req.body;
    const senderId = req.user.userId;

    // Prevent sending message to self
    if (recipientId === senderId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    // Check if recipient exists
    const recipient = await BaseUser.findById(recipientId).select('firstName lastName email role');
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Create message
    const messageData = {
      senderId,
      recipientId,
      content,
      subject,
      messageType,
      attachments: attachments || [],
      status: 'sent'
    };

    const message = new Message(messageData);
    await message.save();

    // Populate the response
    await message.populate([
      { path: 'senderId', select: 'firstName lastName profilePicture' },
      { path: 'recipientId', select: 'firstName lastName profilePicture' }
    ]);

    // Send real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('newMessage', {
        messageId: message._id,
        conversationId: [senderId, recipientId].sort().join('-'),
        sender: message.senderId,
        content: message.content,
        createdAt: message.createdAt
      });
    }

    // Send push notification
    try {
      await sendNotification({
        userId: recipientId,
        type: 'new_message',
        title: 'New Message',
        message: `${req.user.firstName} ${req.user.lastName} sent you a message`,
        data: {
          messageId: message._id,
          senderId,
          senderName: `${req.user.firstName} ${req.user.lastName}`
        }
      });
    } catch (notificationError) {
      console.error('Error sending message notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID format'
      });
    }

    // Find message and verify recipient
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.recipientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your own received messages as read'
      });
    }

    if (message.status === 'read') {
      return res.json({
        success: true,
        message: 'Message already marked as read'
      });
    }

    // Update message status
    message.status = 'read';
    message.readAt = new Date();
    await message.save();

    // Send read receipt via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${message.senderId}`).emit('messageRead', {
        messageId: message._id,
        readAt: message.readAt
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/messages/conversation/:conversationId/read-all
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/conversation/:conversationId/read-all', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Parse conversation ID to get participant IDs
    const [participant1, participant2] = conversationId.split('-');
    
    if (![participant1, participant2].includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const otherParticipantId = participant1 === userId ? participant2 : participant1;

    // Mark all unread messages as read
    const result = await Message.updateMany(
      {
        senderId: otherParticipantId,
        recipientId: userId,
        status: 'sent'
      },
      { 
        status: 'read', 
        readAt: new Date() 
      }
    );

    // Send read receipt via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${otherParticipantId}`).emit('conversationRead', {
        conversationId,
        readAt: new Date(),
        readCount: result.modifiedCount
      });
    }

    res.json({
      success: true,
      message: 'All messages marked as read',
      data: {
        markedAsRead: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private (Sender only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID format'
      });
    }

    // Find message and verify sender
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own sent messages'
      });
    }

    // Check if message can be deleted (within 5 minutes of sending)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      return res.status(400).json({
        success: false,
        message: 'Messages can only be deleted within 5 minutes of sending'
      });
    }

    // Soft delete - mark as deleted
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Notify recipient via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${message.recipientId}`).emit('messageDeleted', {
        messageId: message._id
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/messages/search
// @desc    Search messages
// @access  Private
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, page = 1, limit = 20, conversationId } = req.query;
    const userId = req.user.userId;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build search criteria
    const searchCriteria = {
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ],
      content: new RegExp(query.trim(), 'i'),
      messageType: { $ne: 'system' },
      isDeleted: { $ne: true }
    };

    // Filter by conversation if specified
    if (conversationId) {
      const [participant1, participant2] = conversationId.split('-');
      if ([participant1, participant2].includes(userId)) {
        const otherParticipantId = participant1 === userId ? participant2 : participant1;
        searchCriteria.$or = [
          { senderId: userId, recipientId: otherParticipantId },
          { senderId: otherParticipantId, recipientId: userId }
        ];
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const [messages, totalMessages] = await Promise.all([
      Message.find(searchCriteria)
        .populate('senderId', 'firstName lastName profilePicture')
        .populate('recipientId', 'firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments(searchCriteria)
    ]);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / parseInt(limit)),
          totalMessages,
          limit: parseInt(limit)
        },
        searchQuery: query
      }
    });

  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
