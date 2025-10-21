import { db } from '../config/database.js';
import { users, applications, jobs, companies } from '../schema.js';
import { eq, and, desc, asc, sql, or, like } from 'drizzle-orm';
import nodemailer from 'nodemailer';

// For this implementation, we'll create a simple interviews table structure
// In a real app, you'd have a proper interviews table in your schema
const mockInterviews = [
  {
    id: 1,
    candidate_id: 1,
    job_id: 1,
    interviewer: 'John Smith',
    type: 'video',
    status: 'scheduled',
    scheduled_date: '2024-01-15T10:00:00Z',
    duration: 60,
    meeting_link: 'https://zoom.us/j/123456789',
    notes: 'Technical round - React and Node.js focus',
    round: 1,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  }
];

// Get all interviews with filtering
export const getInterviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      candidate_id,
      job_id,
      status,
      interviewer,
      date_from,
      date_to,
      sort_by = 'scheduled_date',
      sort_order = 'asc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // In a real implementation, this would query the interviews table
    // For now, we'll return mock data with filtering
    let filteredInterviews = [...mockInterviews];

    if (candidate_id) {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.candidate_id === parseInt(candidate_id)
      );
    }

    if (job_id) {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.job_id === parseInt(job_id)
      );
    }

    if (status) {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.status === status
      );
    }

    if (interviewer) {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.interviewer.toLowerCase().includes(interviewer.toLowerCase())
      );
    }

    if (date_from) {
      filteredInterviews = filteredInterviews.filter(interview => 
        new Date(interview.scheduled_date) >= new Date(date_from)
      );
    }

    if (date_to) {
      filteredInterviews = filteredInterviews.filter(interview => 
        new Date(interview.scheduled_date) <= new Date(date_to)
      );
    }

    // Sort interviews
    filteredInterviews.sort((a, b) => {
      const aValue = a[sort_by];
      const bValue = b[sort_by];
      
      if (sort_order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const paginatedInterviews = filteredInterviews.slice(offset, offset + parseInt(limit));
    const total = filteredInterviews.length;
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get candidate and job details for each interview
    const interviewsWithDetails = await Promise.all(
      paginatedInterviews.map(async (interview) => {
        // Get candidate details
        const candidateResult = await db.select({
          id: users.id,
          name: users.full_name,
          email: users.email,
          phone: users.phone
        })
        .from(users)
        .where(eq(users.id, interview.candidate_id))
        .limit(1);

        // Get job details
        const jobResult = await db.select({
          id: jobs.id,
          title: jobs.title,
          company_name: companies.name
        })
        .from(jobs)
        .leftJoin(companies, eq(jobs.company_id, companies.id))
        .where(eq(jobs.id, interview.job_id))
        .limit(1);

        return {
          ...interview,
          candidate: candidateResult[0] || null,
          job: jobResult[0] || null
        };
      })
    );

    res.json({
      interviews: interviewsWithDetails,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: parseInt(page) < totalPages,
        has_prev: parseInt(page) > 1
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

    // In a real implementation, this would query the interviews table
    const interview = mockInterviews.find(i => i.id === parseInt(id));

    if (!interview) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    // Get candidate details
    const candidateResult = await db.select({
      id: users.id,
      name: users.full_name,
      email: users.email,
      phone: users.phone,
      linkedin_url: users.linkedin_url,
      resume_url: users.resume_url
    })
    .from(users)
    .where(eq(users.id, interview.candidate_id))
    .limit(1);

    // Get job details
    const jobResult = await db.select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      requirements: jobs.requirements,
      company_name: companies.name
    })
    .from(jobs)
    .leftJoin(companies, eq(jobs.company_id, companies.id))
    .where(eq(jobs.id, interview.job_id))
    .limit(1);

    res.json({
      interview: {
        ...interview,
        candidate: candidateResult[0] || null,
        job: jobResult[0] || null
      }
    });

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
      candidate_id,
      job_id,
      interviewer,
      type,
      scheduled_date,
      duration,
      meeting_link,
      location,
      notes,
      round = 1
    } = req.body;

    // Validate required fields
    if (!candidate_id || !interviewer || !type || !scheduled_date) {
      return res.status(400).json({ 
        message: 'Candidate ID, interviewer, type, and scheduled date are required' 
      });
    }

    // Validate interview type
    const validTypes = ['video', 'phone', 'in-person'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        message: `Invalid interview type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    // Validate scheduled date is in the future
    if (new Date(scheduled_date) <= new Date()) {
      return res.status(400).json({ 
        message: 'Scheduled date must be in the future' 
      });
    }

    // Check if candidate exists
    const candidateResult = await db.select()
      .from(users)
      .where(and(eq(users.id, parseInt(candidate_id)), eq(users.role, 'applicant')))
      .limit(1);

    if (candidateResult.length === 0) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    const candidate = candidateResult[0];

    // In a real implementation, you'd insert into interviews table
    const newInterview = {
      id: Math.max(...mockInterviews.map(i => i.id), 0) + 1,
      candidate_id: parseInt(candidate_id),
      job_id: job_id ? parseInt(job_id) : null,
      interviewer,
      type,
      status: 'scheduled',
      scheduled_date,
      duration: duration || 60,
      meeting_link: type === 'video' ? meeting_link : null,
      location: type === 'in-person' ? location : null,
      notes: notes || '',
      round: parseInt(round),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockInterviews.push(newInterview);

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
    const {
      interviewer,
      type,
      scheduled_date,
      duration,
      meeting_link,
      location,
      notes,
      status,
      round
    } = req.body;

    // Find interview
    const interviewIndex = mockInterviews.findIndex(i => i.id === parseInt(id));
    
    if (interviewIndex === -1) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    const interview = mockInterviews[interviewIndex];

    // Validate status if provided
    if (status) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
    }

    // Validate interview type if provided
    if (type) {
      const validTypes = ['video', 'phone', 'in-person'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          message: `Invalid interview type. Must be one of: ${validTypes.join(', ')}` 
        });
      }
    }

    // Validate scheduled date if provided
    if (scheduled_date && new Date(scheduled_date) <= new Date()) {
      return res.status(400).json({ 
        message: 'Scheduled date must be in the future' 
      });
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (interviewer) updateData.interviewer = interviewer;
    if (type) updateData.type = type;
    if (scheduled_date) updateData.scheduled_date = scheduled_date;
    if (duration) updateData.duration = parseInt(duration);
    if (meeting_link !== undefined) updateData.meeting_link = meeting_link;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    if (round) updateData.round = parseInt(round);

    // Update interview
    const updatedInterview = { ...interview, ...updateData };
    mockInterviews[interviewIndex] = updatedInterview;

    // Send notification if rescheduled
    if (scheduled_date && scheduled_date !== interview.scheduled_date) {
      const candidateResult = await db.select()
        .from(users)
        .where(eq(users.id, interview.candidate_id))
        .limit(1);
      
      if (candidateResult.length > 0) {
        await sendInterviewNotification(candidateResult[0], updatedInterview, 'rescheduled');
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

    // Find interview
    const interviewIndex = mockInterviews.findIndex(i => i.id === parseInt(id));
    
    if (interviewIndex === -1) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    const interview = mockInterviews[interviewIndex];

    // Update interview status to cancelled
    const updatedInterview = {
      ...interview,
      status: 'cancelled',
      cancellation_reason: reason || 'No reason provided',
      updated_at: new Date().toISOString()
    };

    mockInterviews[interviewIndex] = updatedInterview;

    // Send cancellation notification
    const candidateResult = await db.select()
      .from(users)
      .where(eq(users.id, interview.candidate_id))
      .limit(1);
    
    if (candidateResult.length > 0) {
      await sendInterviewNotification(candidateResult[0], updatedInterview, 'cancelled');
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

    // Find interview
    const interviewIndex = mockInterviews.findIndex(i => i.id === parseInt(id));
    
    if (interviewIndex === -1) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    const interview = mockInterviews[interviewIndex];

    // Backup interview data before deletion (in real app, move to archived table)
    console.log('Backing up interview before deletion:', {
      ...interview,
      deleted_at: new Date().toISOString(),
      deleted_by: req.user?.id || 'system'
    });

    // Remove from active interviews
    mockInterviews.splice(interviewIndex, 1);

    // Send deletion notification to candidate
    const candidateResult = await db.select()
      .from(users)
      .where(eq(users.id, interview.candidate_id))
      .limit(1);
    
    if (candidateResult.length > 0) {
      await sendInterviewNotification(candidateResult[0], interview, 'deleted');
    }

    res.json({
      message: 'Interview deleted successfully and backed up',
      deleted_interview_id: parseInt(id)
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
    const { feedback, rating, recommendation, notes } = req.body;

    // Validate required fields
    if (!feedback) {
      return res.status(400).json({ 
        message: 'Feedback is required' 
      });
    }

    // Find interview
    const interviewIndex = mockInterviews.findIndex(i => i.id === parseInt(id));
    
    if (interviewIndex === -1) {
      return res.status(404).json({ 
        message: 'Interview not found' 
      });
    }

    const interview = mockInterviews[interviewIndex];

    // Update interview with feedback
    const updatedInterview = {
      ...interview,
      feedback,
      rating: rating ? parseFloat(rating) : null,
      recommendation: recommendation || null,
      feedback_notes: notes || '',
      feedback_date: new Date().toISOString(),
      status: interview.status === 'scheduled' ? 'completed' : interview.status,
      updated_at: new Date().toISOString()
    };

    mockInterviews[interviewIndex] = updatedInterview;

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

    let filteredInterviews = [...mockInterviews];

    if (date_from) {
      filteredInterviews = filteredInterviews.filter(interview => 
        new Date(interview.scheduled_date) >= new Date(date_from)
      );
    }

    if (date_to) {
      filteredInterviews = filteredInterviews.filter(interview => 
        new Date(interview.scheduled_date) <= new Date(date_to)
      );
    }

    // Calculate statistics
    const totalInterviews = filteredInterviews.length;
    const completedInterviews = filteredInterviews.filter(i => i.status === 'completed').length;
    const scheduledInterviews = filteredInterviews.filter(i => i.status === 'scheduled').length;
    const cancelledInterviews = filteredInterviews.filter(i => i.status === 'cancelled').length;

    // Interviews by status
    const interviewsByStatus = [
      { status: 'scheduled', count: scheduledInterviews },
      { status: 'completed', count: completedInterviews },
      { status: 'cancelled', count: cancelledInterviews }
    ];

    // Interviews by type
    const interviewsByType = [
      { type: 'video', count: filteredInterviews.filter(i => i.type === 'video').length },
      { type: 'phone', count: filteredInterviews.filter(i => i.type === 'phone').length },
      { type: 'in-person', count: filteredInterviews.filter(i => i.type === 'in-person').length }
    ];

    res.json({
      total_interviews: totalInterviews,
      completed_interviews: completedInterviews,
      scheduled_interviews: scheduledInterviews,
      cancelled_interviews: cancelledInterviews,
      interviews_by_status: interviewsByStatus,
      interviews_by_type: interviewsByType
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
