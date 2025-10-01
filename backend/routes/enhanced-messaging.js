import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import { BaseUser } from '../models/UserModels.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// REAL-TIME MESSAGING SYSTEM
// ============================================================================

// Get all conversations for a user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Get unique conversations (users this user has messaged with)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
              then: '$receiverId',
              else: '$senderId'
            }
          }
        }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $last: '$content' },
          lastMessageDate: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
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
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 1,
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          role: '$userInfo.role',
          profilePicture: '$userInfo.profilePicture',
          lastMessage: 1,
          lastMessageDate: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageDate: -1 }
      }
    ]);

    res.json({
      success: true,
      data: { conversations }
    });

  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// Get conversation with a specific user
router.get('/conversation/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { otherUserId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Verify other user exists
    const otherUser = await BaseUser.findById(otherUserId, 'firstName lastName role profilePicture');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get messages between these two users
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
    .populate('senderId', 'firstName lastName role profilePicture')
    .populate('receiverId', 'firstName lastName role profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: {
        otherUser,
        messages: messages.reverse(), // Reverse to show oldest first
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    console.error('Conversation fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { receiverId, content, subject, messageType = 'text' } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required'
      });
    }

    // Verify receiver exists
    const receiver = await BaseUser.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    const message = new Message({
      senderId: userId,
      receiverId,
      content,
      subject,
      messageType,
      isRead: false
    });

    await message.save();

    // Populate sender and receiver info
    await message.populate('senderId', 'firstName lastName role profilePicture');
    await message.populate('receiverId', 'firstName lastName role profilePicture');

    // Emit real-time message if socket.io is available
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${receiverId}`).emit('newMessage', {
        message,
        sender: message.senderId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Mark message as read
router.put('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or already read'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read',
      data: { message }
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;

    const message = await Message.findOneAndDelete({
      _id: messageId,
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Message delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

// Search messages
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const messages = await Message.find({
      $and: [
        {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        {
          $or: [
            { content: { $regex: query, $options: 'i' } },
            { subject: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .populate('senderId', 'firstName lastName role')
    .populate('receiverId', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      data: { messages }
    });

  } catch (error) {
    console.error('Message search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: error.message
    });
  }
});

// ============================================================================
// APPLICATION-RELATED MESSAGING
// ============================================================================

// Send message related to a job application
router.post('/application/:applicationId/message', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { applicationId } = req.params;
    const { content, subject } = req.body;

    // Get application details
    const Application = mongoose.model('Application');
    const application = await Application.findById(applicationId)
      .populate('jobId', 'jobTitle companyName postedBy')
      .populate('applicantId', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    let receiverId;
    if (role === 'applicant' && application.applicantId._id.toString() === userId) {
      // Applicant sending to recruiter
      receiverId = application.jobId.postedBy;
    } else if (role === 'recruiter' && application.jobId.postedBy.toString() === userId) {
      // Recruiter sending to applicant
      receiverId = application.applicantId._id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to message about this application'
      });
    }

    const message = new Message({
      senderId: userId,
      receiverId,
      content,
      subject: subject || `Regarding: ${application.jobId.jobTitle}`,
      messageType: 'application',
      relatedApplication: applicationId,
      relatedJob: application.jobId._id
    });

    await message.save();
    await message.populate('senderId', 'firstName lastName role');
    await message.populate('receiverId', 'firstName lastName role');

    // Send real-time notification
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${receiverId}`).emit('newApplicationMessage', {
        message,
        application: {
          _id: application._id,
          jobTitle: application.jobId.jobTitle,
          companyName: application.jobId.companyName
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Application message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send application message',
      error: error.message
    });
  }
});

// ============================================================================
// INTERVIEW-RELATED MESSAGING
// ============================================================================

// Send interview details and schedule to applicant
router.post('/interview/:interviewId/notify', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { interviewId } = req.params;
    const { customMessage } = req.body;

    if (role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can send interview notifications'
      });
    }

    const Interview = mongoose.model('Interview');
    const interview = await Interview.findById(interviewId)
      .populate('jobId', 'jobTitle companyName')
      .populate('candidateId', 'firstName lastName email')
      .populate('recruiterId', 'firstName lastName companyInfo');

    if (!interview || interview.recruiterId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized or interview not found'
      });
    }

    const defaultMessage = `
Hello ${interview.candidateId.firstName},

You have been selected for an interview for the position of ${interview.jobId.jobTitle} at ${interview.jobId.companyName}.

Interview Details:
- Date: ${interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleDateString() : 'TBD'}
- Time: ${interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleTimeString() : 'TBD'}
- Type: ${interview.type || 'Interview'}
- Round: ${interview.round || 1}

${customMessage || 'Please confirm your availability. We look forward to speaking with you!'}

Best regards,
${interview.recruiterId.firstName} ${interview.recruiterId.lastName}
${interview.recruiterId.companyInfo?.companyName || ''}
    `.trim();

    const message = new Message({
      senderId: userId,
      receiverId: interview.candidateId._id,
      content: defaultMessage,
      subject: `Interview Scheduled - ${interview.jobId.jobTitle}`,
      messageType: 'interview',
      relatedInterview: interviewId,
      relatedJob: interview.jobId._id
    });

    await message.save();
    await message.populate('senderId', 'firstName lastName role');

    // Update interview status
    interview.notificationSent = true;
    interview.notificationSentAt = new Date();
    await interview.save();

    // Send real-time notification
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${interview.candidateId._id}`).emit('interviewScheduled', {
        message,
        interview: {
          _id: interview._id,
          jobTitle: interview.jobId.jobTitle,
          scheduledDate: interview.scheduledDate,
          type: interview.type
        }
      });
    }

    res.json({
      success: true,
      message: 'Interview notification sent successfully',
      data: { message, interview }
    });

  } catch (error) {
    console.error('Interview notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send interview notification',
      error: error.message
    });
  }
});

export default router;
