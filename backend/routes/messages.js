import express from 'express';
import Message from '../models/Message.js';
import { BaseUser } from '../models/UserModels.js';
import mongoose from 'mongoose';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await BaseUser.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// GET /api/messages/conversations - Get user's conversations list
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const conversations = await Message.getUserConversations(userId);
    
    // Transform the data for frontend
    const transformedConversations = conversations.map(conv => ({
      id: conv._id,
      name: `${conv.otherUser.firstName} ${conv.otherUser.lastName}`,
      role: conv.otherUser.role,
      company: conv.otherUser.companyInfo?.companyName || null,
      lastMessage: conv.lastMessage.content,
      timestamp: conv.lastMessage.createdAt,
      unread: conv.unreadCount > 0,
      unreadCount: conv.unreadCount,
      avatar: `${conv.otherUser.firstName.charAt(0)}${conv.otherUser.lastName.charAt(0)}`
    }));

    res.json({
      success: true,
      data: {
        conversations: transformedConversations,
        total: conversations.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// GET /api/messages/conversation/:userId - Get conversation with specific user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const messages = await Message.getConversation(currentUserId, otherUserId, limit);
    
    // Mark messages as read (messages received by current user)
    await Message.updateMany(
      { 
        senderId: otherUserId, 
        receiverId: currentUserId, 
        isRead: false 
      },
      { isRead: true }
    );

    // Transform messages for frontend
    const transformedMessages = messages.map(msg => ({
      id: msg._id,
      content: msg.content,
      subject: msg.subject,
      timestamp: msg.createdAt,
      senderId: msg.senderId._id,
      senderName: `${msg.senderId.firstName} ${msg.senderId.lastName}`,
      senderRole: msg.senderId.role,
      isRead: msg.isRead,
      messageType: msg.messageType,
      priority: msg.priority,
      attachments: msg.attachments || []
    }));

    res.json({
      success: true,
      data: {
        messages: transformedMessages.reverse(), // Show oldest first
        total: messages.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
});

// POST /api/messages - Send a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, subject, content, messageType, priority, relatedJobId, relatedApplicationId } = req.body;

    // Validate required fields
    if (!receiverId || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID, subject, and content are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID'
      });
    }

    // Check if receiver exists
    const receiver = await BaseUser.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      subject: subject.trim(),
      content: content.trim(),
      messageType: messageType || 'general',
      priority: priority || 'normal',
      relatedJobId: relatedJobId || null,
      relatedApplicationId: relatedApplicationId || null
    });

    await newMessage.save();

    // Populate sender and receiver info
    await newMessage.populate('senderId', 'firstName lastName email role');
    await newMessage.populate('receiverId', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      data: {
        message: {
          id: newMessage._id,
          content: newMessage.content,
          subject: newMessage.subject,
          timestamp: newMessage.createdAt,
          senderId: newMessage.senderId._id,
          senderName: `${newMessage.senderId.firstName} ${newMessage.senderId.lastName}`,
          receiverId: newMessage.receiverId._id,
          receiverName: `${newMessage.receiverId.firstName} ${newMessage.receiverId.lastName}`,
          messageType: newMessage.messageType,
          priority: newMessage.priority,
          isRead: newMessage.isRead
        }
      },
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// PUT /api/messages/:messageId/read - Mark message as read
router.put('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only the receiver can mark message as read
    if (message.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    message.isRead = true;
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
});

// GET /api/messages/stats - Get messaging statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [totalReceived, totalSent, unreadCount] = await Promise.all([
      Message.countDocuments({ receiverId: userId }),
      Message.countDocuments({ senderId: userId }),
      Message.countDocuments({ receiverId: userId, isRead: false })
    ]);

    res.json({
      success: true,
      data: {
        totalReceived,
        totalSent,
        unreadCount,
        totalMessages: totalReceived + totalSent
      }
    });

  } catch (error) {
    console.error('❌ Error fetching message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
});

// DELETE /api/messages/:messageId - Delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender or receiver can delete the message
    if (message.senderId.toString() !== userId && message.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

export default router;
