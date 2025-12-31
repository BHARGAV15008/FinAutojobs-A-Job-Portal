import { BaseUser } from '../../models/UserModels.js';
import Application from '../../models/Application.js';
import Job from '../../models/Job.js';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Get all candidates with filtering and search
export const getCandidates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sort_by = 'createdAt',
      sort_order = 'desc',
      experience_min,
      experience_max,
      skills,
      location
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let query = { role: 'applicant' };

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { bio: searchRegex },
        { 'skills.primary': searchRegex }
      ];
    }

    if (experience_min) {
      query.yearsOfExperience = { ...query.yearsOfExperience, $gte: parseInt(experience_min) };
    }

    if (experience_max) {
      query.yearsOfExperience = { ...query.yearsOfExperience, $lte: parseInt(experience_max) };
    }

    if (location) {
      query.city = { $regex: location, $options: 'i' };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query['skills.primary'] = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    const sortOptions = { [sort_by]: sort_order === 'asc' ? 1 : -1 };

    const candidates = await BaseUser.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const total = await BaseUser.countDocuments(query);
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      candidates,
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
    console.error('Get candidates error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching candidates' 
    });
  }
};

// Get single candidate by ID with detailed information
export const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await BaseUser.findOne({ _id: id, role: 'applicant' });

    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    // Get candidate's applications
    const applications = await Application.find({ applicant: id })
        .populate({
            path: 'job',
            select: 'title companyId',
            populate: {
                path: 'companyId',
                model: 'Company',
                select: 'name'
            }
        })
        .sort({ appliedAt: -1 });
        
    const transformedApplications = applications.map(app => ({
        id: app._id,
        job_title: app.job.title,
        company_name: app.job.companyId.name,
        status: app.status,
        applied_at: app.appliedAt,
        cover_letter: app.coverLetter
    }));

    res.json({
      candidate: {
        ...candidate.toObject(),
        applications: transformedApplications
      }
    });

  } catch (error) {
    console.error('Get candidate by ID error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching candidate' 
    });
  }
};

// Update candidate status
export const updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'shortlisted', 'contacted', 'not_interested', 'hired'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Prepare update data
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Update candidate
    const updatedCandidate = await BaseUser.findOneAndUpdate(
        { _id: id, role: 'applicant' },
        { $set: updateData },
        { new: true }
    );

    if (!updatedCandidate) {
        return res.status(404).json({ 
            message: 'Candidate not found' 
        });
    }

    res.json({
      message: 'Candidate status updated successfully',
      candidate: updatedCandidate
    });

  } catch (error) {
    console.error('Update candidate status error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating candidate status' 
    });
  }
};

// Send email to candidate
export const sendEmailToCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, template, schedule_send, schedule_date } = req.body;

    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({ 
        message: 'Subject and message are required' 
      });
    }

    // Get candidate details
    const candidate = await BaseUser.findOne({ _id: id, role: 'applicant' });

    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    // Configure email transporter (you'll need to set up your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@finautojobs.com',
      to: candidate.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${candidate.firstName},</h2>
          <div style="line-height: 1.6; color: #666;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <br>
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #888; font-size: 12px;">
            <p>Best regards,<br>FinAutoJobs Team</p>
            <p>This is an automated email. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    // Send email (or schedule if requested)
    if (schedule_send && schedule_date) {
      // In a real implementation, you'd use a job queue like Bull or Agenda
      // For now, we'll just log the scheduled email
      console.log('Email scheduled for:', schedule_date, mailOptions);
      res.json({
        message: 'Email scheduled successfully',
        scheduled_for: schedule_date
      });
    } else {
      await transporter.sendMail(mailOptions);
      
      // Log the communication
      // In a real app, you'd store this in a communications table
      console.log('Email sent to candidate:', candidate.email);
      
      res.json({
        message: 'Email sent successfully',
        recipient: candidate.email
      });
    }

  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ 
      message: 'Internal server error while sending email' 
    });
  }
};

// Download candidate resume
export const downloadCandidateResume = async (req, res) => {
  try {
    const { id } = req.params;

    // Get candidate details from MongoDB
    const candidate = await BaseUser.findById(id);
    
    if (!candidate || candidate.role !== 'applicant') {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    const username = candidate.username;
    const candidateName = candidate.fullName || candidate.firstName + ' ' + candidate.lastName;
    const projectRoot = path.join(process.cwd(), '..');
    
    // Try different possible resume file extensions and locations with new username format
    const possiblePaths = [
      // New username-based format
      path.join(projectRoot, 'uploads', 'documents', `resume_${username}.pdf`),
      path.join(projectRoot, 'uploads', 'documents', `resume_${username}.doc`),
      path.join(projectRoot, 'uploads', 'documents', `resume_${username}.docx`),
      path.join(projectRoot, 'uploads', 'applications', `resume_${username}.pdf`),
      path.join(projectRoot, 'uploads', 'applications', `resume_${username}.doc`),
      path.join(projectRoot, 'uploads', 'applications', `resume_${username}.docx`),
    ];
    
    // Also check if there's a resume URL in the profile
    const existingResumeUrl = candidate.documents?.resumeUrl;
    if (existingResumeUrl) {
      if (existingResumeUrl.startsWith('http')) {
        // External URL - redirect to the URL
        return res.redirect(existingResumeUrl);
      } else if (existingResumeUrl.startsWith('/uploads/')) {
        // Relative path from uploads
        possiblePaths.unshift(path.join(projectRoot, existingResumeUrl.substring(1)));
      } else if (existingResumeUrl.includes('uploads/')) {
        // Path includes uploads
        possiblePaths.unshift(path.join(projectRoot, existingResumeUrl));
      }
    }
    
    let resumePath = null;
    let filename = `resume_${username}.pdf`;
    
    // Check each possible path
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        resumePath = filePath;
        filename = path.basename(filePath);
        break;
      }
    }
    
    // If no file found with new format, try old format patterns
    if (!resumePath) {
      const oldFormatDirs = [
        path.join(projectRoot, 'uploads', 'documents'),
        path.join(projectRoot, 'uploads', 'applications')
      ];
      
      for (const dir of oldFormatDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const matchingFile = files.find(file => 
            (file.startsWith(`resume-${id}-`) || file.startsWith(`resume_${id}_`)) && 
            (file.endsWith('.pdf') || file.endsWith('.doc') || file.endsWith('.docx'))
          );
          if (matchingFile) {
            resumePath = path.join(dir, matchingFile);
            filename = matchingFile;
            break;
          }
        }
      }
    }
    
    if (!resumePath) {
      return res.status(404).json({
        message: `Resume not found for candidate ${candidateName}`,
        candidate_id: id,
        username: username,
        searched_locations: possiblePaths
      });
    }
    
    // Set appropriate headers for file download
    const ext = path.extname(resumePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    // Use clean filename for download
    const cleanName = candidateName.replace(/[^a-zA-Z0-9]/g, '_');
    const downloadFilename = `${cleanName}_Resume${ext}`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(resumePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      res.status(500).json({ 
        message: 'Error reading resume file' 
      });
    });
    
    console.log(`✅ Resume downloaded: ${filename} for candidate ${candidateName} (${username})`);

  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ 
      message: 'Internal server error while downloading resume',
      error: error.message
    });
  }
};

// Get candidate statistics
export const getCandidateStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = await BaseUser.aggregate([
      { $match: { role: 'applicant' } },
      {
        $facet: {
          totalCandidates: [{ $count: 'count' }],
          candidatesByStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          recentCandidates: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $count: 'count' }
          ],
          candidatesByExperience: [
            {
              $group: {
                _id: {
                  $switch: {
                    branches: [
                      { case: { $lte: ['$yearsOfExperience', 2] }, then: 'Entry Level (0-2 years)' },
                      { case: { $lte: ['$yearsOfExperience', 5] }, then: 'Mid Level (3-5 years)' },
                      { case: { $lte: ['$yearsOfExperience', 10] }, then: 'Senior Level (6-10 years)' }
                    ],
                    default: 'Expert Level (10+ years)'
                  }
                },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const getCount = (arr) => arr[0] ? arr[0].count : 0;

    res.json({
      total_candidates: getCount(stats[0].totalCandidates),
      recent_candidates: getCount(stats[0].recentCandidates),
      candidates_by_status: stats[0].candidatesByStatus.map(item => ({ status: item._id, count: item.count })),
      candidates_by_experience: stats[0].candidatesByExperience.map(item => ({ experience_range: item._id, count: item.count }))
    });

  } catch (error) {
    console.error('Get candidate stats error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching candidate statistics' 
    });
  }
};

// Bulk update candidates
export const bulkUpdateCandidates = async (req, res) => {
  try {
    const { candidate_ids, status, notes } = req.body;

    // Validate required fields
    if (!candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return res.status(400).json({ 
        message: 'Candidate IDs array is required' 
      });
    }

    if (!status) {
      return res.status(400).json({ 
        message: 'Status is required' 
      });
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'shortlisted', 'contacted', 'not_interested', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Prepare update data
    const updateData = {
      status,
    };

    if (notes) updateData.notes = notes;

    // Update candidates
    const result = await BaseUser.updateMany(
      { _id: { $in: candidate_ids }, role: 'applicant' },
      { $set: updateData }
    );

    res.json({
      message: `${result.nModified} candidates updated successfully`,
      updated_count: result.nModified
    });

  } catch (error) {
    console.error('Bulk update candidates error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating candidates' 
    });
  }
};

export default {
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  sendEmailToCandidate,
  downloadCandidateResume,
  getCandidateStats,
  bulkUpdateCandidates
};
