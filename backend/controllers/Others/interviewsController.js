import Interview from '../models/Interview.js';
import { BaseUser } from '../../models/UserModels.js';
import Job from '../models/Job.js';
import nodemailer from 'nodemailer';

// Get all interviews with filtering
export const getInterviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      candidateId,
      jobId,
      status,
      interviewer,
      date_from,
      date_to,
      sort_by = 'scheduledDate',
      sort_order = 'asc'
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let query = {};
    if (candidateId) query.candidateId = candidateId;
    if (jobId) query.jobId = jobId;
    if (status) query.status = status;
    if (interviewer) query['interviewers.name'] = { $regex: interviewer, $options: 'i' };
    if (date_from) query.scheduledDate = { ...query.scheduledDate, $gte: new Date(date_from) };
    if (date_to) query.scheduledDate = { ...query.scheduledDate, $lte: new Date(date_to) };

    const sortOptions = { [sort_by]: sort_order === 'asc' ? 1 : -1 };

    const interviews = await Interview.find(query)
      .populate('candidateId', 'firstName lastName email phone')
      .populate('jobId', 'title')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const total = await Interview.countDocuments(query);
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      interviews,
      pagination: {
        current_page: pageNumber,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNumber,
        has_next: pageNumber < totalPages,
        has_prev: pageNumber > 1
      }
    });

  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching interviews' 
    });
  }
};

// Get single interview by ID
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findById(id)
      .populate('candidateId', 'firstName lastName email phone linkedin_url documents.resumeUrl')
      .populate('jobId', 'title description requirements');

    if (!interview) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    res.json({ interview });

  } catch (error) {
    console.error('Get interview by ID error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching interview' 
    });
  }
};

// Schedule new interview
export const scheduleInterview = async (req, res) => {
  try {
    const {
      candidateId,
      jobId,
      applicationId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      timezone,
      type,
      location,
      meetingLink,
      interviewers,
      notes,
      round
    } = req.body;

    // Validate required fields
    if (!candidateId || !jobId || !applicationId || !title || !scheduledDate || !scheduledTime || !type) {
      return res.status(400).json({ 
        message: 'Candidate ID, Job ID, Application ID, title, scheduled date, scheduled time and type are required' 
      });
    }

    // Check if candidate exists
    const candidate = await BaseUser.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    const newInterview = new Interview({
      candidateId,
      jobId,
      recruiterId: req.user.id, // Assuming recruiter is the logged in user
      applicationId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      timezone,
      type,
      location,
      meetingLink,
      interviewers,
      notes,
      round,
      createdBy: req.user.id
    });

    await newInterview.save();

    // Send notification email to candidate
    await sendInterviewNotification(candidate, newInterview, 'scheduled');

    res.status(201).json({
      message: 'Interview scheduled successfully',
      interview: newInterview
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ 
      message: 'Internal server error while scheduling interview' 
    });
  }
};

// Update interview (reschedule, update details)
export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedBy = req.user.id;

    const updatedInterview = await Interview.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedInterview) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    // Send notification if rescheduled
    if (updateData.scheduledDate) {
        const candidate = await BaseUser.findById(updatedInterview.candidateId);
        if (candidate) {
            await sendInterviewNotification(candidate, updatedInterview, 'rescheduled');
        }
    }

    res.json({
      message: 'Interview updated successfully',
      interview: updatedInterview
    });

  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating interview' 
    });
  }
};

// Cancel interview
export const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updatedInterview = await Interview.findByIdAndUpdate(
        id,
        { 
            status: 'cancelled', 
            'cancellation.reason': reason || 'No reason provided', 
            'cancellation.cancelledBy': req.user.id, 
            'cancellation.cancelledAt': new Date() 
        },
        { new: true }
    );

    if (!updatedInterview) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    // Send cancellation notification
    const candidate = await BaseUser.findById(updatedInterview.candidateId);
    if (candidate) {
        await sendInterviewNotification(candidate, updatedInterview, 'cancelled');
    }

    res.json({
      message: 'Interview cancelled successfully',
      interview: updatedInterview
    });

  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json({ 
      message: 'Internal server error while cancelling interview' 
    });
  }
};

// Delete interview permanently
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findByIdAndDelete(id);

    if (!interview) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    // Send deletion notification to candidate
    const candidate = await BaseUser.findById(interview.candidateId);
    if (candidate) {
        await sendInterviewNotification(candidate, interview, 'deleted');
    }

    res.json({
      message: 'Interview deleted successfully',
      deleted_interview_id: id
    });

  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ 
      message: 'Internal server error while deleting interview' 
    });
  }
};

// Add interview feedback
export const addInterviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments, strengths, weaknesses, recommendation, technicalSkills, communication, problemSolving, culturalFit } = req.body;

    // Validate required fields
    if (!comments) {
      return res.status(400).json({ 
        message: 'Feedback comments are required' 
      });
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
        id,
        { 
            'feedback.rating': rating,
            'feedback.comments': comments,
            'feedback.strengths': strengths,
            'feedback.weaknesses': weaknesses,
            'feedback.recommendation': recommendation,
            'feedback.technicalSkills': technicalSkills,
            'feedback.communication': communication,
            'feedback.problemSolving': problemSolving,
            'feedback.culturalFit': culturalFit,
            status: 'completed'
        },
        { new: true }
    );

    if (!updatedInterview) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    res.json({
      message: 'Interview feedback added successfully',
      interview: updatedInterview
    });

  } catch (error) {
    console.error('Add interview feedback error:', error);
    res.status(500).json({ 
      message: 'Internal server error while adding interview feedback' 
    });
  }
};

// Get interview statistics
export const getInterviewStats = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let query = {};
    if (date_from) query.scheduledDate = { ...query.scheduledDate, $gte: new Date(date_from) };
    if (date_to) query.scheduledDate = { ...query.scheduledDate, $lte: new Date(date_to) };
    
    const stats = await Interview.aggregate([
        { $match: query },
        {
            $facet: {
                totalInterviews: [{ $count: 'count' }],
                completedInterviews: [{ $match: { status: 'completed' } }, { $count: 'count' }],
                scheduledInterviews: [{ $match: { status: 'scheduled' } }, { $count: 'count' }],
                cancelledInterviews: [{ $match: { status: 'cancelled' } }, { $count: 'count' }],
                interviewsByStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
                interviewsByType: [{ $group: { _id: '$type', count: { $sum: 1 } } }]
            }
        }
    ]);

    const getCount = (arr) => arr[0] ? arr[0].count : 0;

    res.json({
      total_interviews: getCount(stats[0].totalInterviews),
      completed_interviews: getCount(stats[0].completedInterviews),
      scheduled_interviews: getCount(stats[0].scheduledInterviews),
      cancelled_interviews: getCount(stats[0].cancelledInterviews),
      interviews_by_status: stats[0].interviewsByStatus.map(item => ({ status: item._id, count: item.count })),
      interviews_by_type: stats[0].interviewsByType.map(item => ({ type: item._id, count: item.count }))
    });

  } catch (error) {
    console.error('Get interview stats error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching interview statistics' 
    });
  }
};

// Helper function to send interview notifications
const sendInterviewNotification = async (candidate, interview, action) => {
  try {
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    let subject, message;

    switch (action) {
      case 'scheduled':
        subject = 'Interview Scheduled - FinAutoJobs';
        message = `
          <h2>Interview Scheduled</h2>
          <p>Dear ${candidate.full_name},</p>
          <p>Your interview has been scheduled with the following details:</p>
          <ul>
            <li><strong>Date:</strong> ${new Date(interview.scheduled_date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${new Date(interview.scheduled_date).toLocaleTimeString()}</li>
            <li><strong>Duration:</strong> ${interview.duration} minutes</li>
            <li><strong>Type:</strong> ${interview.type}</li>
            <li><strong>Interviewer:</strong> ${interview.interviewer}</li>
            ${interview.meeting_link ? `<li><strong>Meeting Link:</strong> <a href="${interview.meeting_link}">${interview.meeting_link}</a></li>` : ''}
            ${interview.location ? `<li><strong>Location:</strong> ${interview.location}</li>` : ''}
          </ul>
          ${interview.notes ? `<p><strong>Notes:</strong> ${interview.notes}</p>` : ''}
          <p>Please confirm your attendance by replying to this email.</p>
        `;
        break;
      
      case 'rescheduled':
        subject = 'Interview Rescheduled - FinAutoJobs';
        message = `
          <h2>Interview Rescheduled</h2>
          <p>Dear ${candidate.full_name},</p>
          <p>Your interview has been rescheduled to:</p>
          <ul>
            <li><strong>New Date:</strong> ${new Date(interview.scheduled_date).toLocaleDateString()}</li>
            <li><strong>New Time:</strong> ${new Date(interview.scheduled_date).toLocaleTimeString()}</li>
            <li><strong>Duration:</strong> ${interview.duration} minutes</li>
            <li><strong>Type:</strong> ${interview.type}</li>
            <li><strong>Interviewer:</strong> ${interview.interviewer}</li>
            ${interview.meeting_link ? `<li><strong>Meeting Link:</strong> <a href="${interview.meeting_link}">${interview.meeting_link}</a></li>` : ''}
            ${interview.location ? `<li><strong>Location:</strong> ${interview.location}</li>` : ''}
          </ul>
          <p>Please confirm your availability for the new time.</p>
        `;
        break;
      
      case 'cancelled':
        subject = 'Interview Cancelled - FinAutoJobs';
        message = `
          <h2>Interview Cancelled</h2>
          <p>Dear ${candidate.full_name},</p>
          <p>We regret to inform you that your scheduled interview has been cancelled.</p>
          ${interview.cancellation_reason ? `<p><strong>Reason:</strong> ${interview.cancellation_reason}</p>` : ''}
          <p>We apologize for any inconvenience caused. We will be in touch if we need to reschedule.</p>
        `;
        break;
      
      case 'deleted':
        subject = 'Interview Removed - FinAutoJobs';
        message = `
          <h2>Interview Removed</h2>
          <p>Dear ${candidate.full_name},</p>
          <p>Your scheduled interview has been permanently removed from our system.</p>
          <p>If you have any questions or concerns, please contact our HR team.</p>
          <p>Thank you for your understanding.</p>
        `;
        break;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@finautojobs.com',
      to: candidate.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${message}
          <br>
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #888; font-size: 12px;">
            <p>Best regards,<br>FinAutoJobs Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Interview ${action} notification sent to:`, candidate.email);

  } catch (error) {
    console.error('Failed to send interview notification:', error);
    // Don't throw error - notification failure shouldn't break the main operation
  }
};

export default {
  getInterviews,
  getInterviewById,
  scheduleInterview,
  updateInterview,
  cancelInterview,
  deleteInterview,
  addInterviewFeedback,
  getInterviewStats
};
