import { db } from '../../config/database.js';
import { users, applications, jobs, companies } from '../../models/Others/schema.js';
import { eq, and, desc, asc, sql, or, like, inArray } from 'drizzle-orm';
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
      sort_by = 'created_at',
      sort_order = 'desc',
      experience_min,
      experience_max,
      skills,
      location
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    let whereConditions = [eq(users.role, 'applicant')];

    if (status) {
      whereConditions.push(eq(users.status, status));
    }

    if (search) {
      whereConditions.push(
        or(
          like(users.full_name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.bio, `%${search}%`),
          like(users.skills, `%${search}%`)
        )
      );
    }

    if (experience_min) {
      whereConditions.push(sql`${users.experience_years} >= ${parseInt(experience_min)}`);
    }

    if (experience_max) {
      whereConditions.push(sql`${users.experience_years} <= ${parseInt(experience_max)}`);
    }

    if (location) {
      whereConditions.push(like(users.location, `%${location}%`));
    }

    if (skills) {
      const skillsArray = skills.split(',');
      const skillConditions = skillsArray.map(skill => 
        like(users.skills, `%${skill.trim()}%`)
      );
      whereConditions.push(or(...skillConditions));
    }

    // Build order by
    const orderBy = sort_order === 'asc' ? asc(users[sort_by]) : desc(users[sort_by]);

    // Get candidates
    const candidatesResult = await db.select({
      id: users.id,
      name: users.full_name,
      email: users.email,
      phone: users.phone,
      location: users.location,
      bio: users.bio,
      skills: users.skills,
      experience: users.experience_years,
      qualification: users.qualification,
      status: users.status,
      created_at: users.created_at,
      updated_at: users.updated_at,
      linkedin_url: users.linkedin_url,
      github_url: users.github_url,
      portfolio_url: users.portfolio_url,
      resume_url: users.resume_url,
      profile_picture: users.profile_picture,
      expected_salary: users.expected_salary,
      availability: users.availability
    })
    .from(users)
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: sql`COUNT(*)` })
      .from(users)
      .where(and(...whereConditions));
    
    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      candidates: candidatesResult,
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

    const candidateResult = await db.select({
      id: users.id,
      name: users.full_name,
      email: users.email,
      phone: users.phone,
      location: users.location,
      bio: users.bio,
      skills: users.skills,
      experience: users.experience_years,
      qualification: users.qualification,
      status: users.status,
      created_at: users.created_at,
      updated_at: users.updated_at,
      linkedin_url: users.linkedin_url,
      github_url: users.github_url,
      portfolio_url: users.portfolio_url,
      resume_url: users.resume_url,
      profile_picture: users.profile_picture,
      expected_salary: users.expected_salary,
      availability: users.availability,
      date_of_birth: users.date_of_birth,
      gender: users.gender,
      address: users.address
    })
    .from(users)
    .where(and(eq(users.id, parseInt(id)), eq(users.role, 'applicant')))
    .limit(1);

    if (candidateResult.length === 0) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    const candidate = candidateResult[0];

    // Get candidate's applications
    const applicationsResult = await db.select({
      id: applications.id,
      job_title: jobs.title,
      company_name: companies.name,
      status: applications.status,
      applied_at: applications.applied_at,
      cover_letter: applications.cover_letter
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.job_id, jobs.id))
    .leftJoin(companies, eq(jobs.company_id, companies.id))
    .where(eq(applications.user_id, parseInt(id)))
    .orderBy(desc(applications.applied_at));

    res.json({
      candidate: {
        ...candidate,
        applications: applicationsResult
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

    // Check if candidate exists
    const existingCandidate = await db.select()
      .from(users)
      .where(and(eq(users.id, parseInt(id)), eq(users.role, 'applicant')))
      .limit(1);

    if (existingCandidate.length === 0) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Update candidate
    const updatedCandidate = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning();

    res.json({
      message: 'Candidate status updated successfully',
      candidate: updatedCandidate[0]
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
    const candidateResult = await db.select({
      id: users.id,
      name: users.full_name,
      email: users.email
    })
    .from(users)
    .where(and(eq(users.id, parseInt(id)), eq(users.role, 'applicant')))
    .limit(1);

    if (candidateResult.length === 0) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    const candidate = candidateResult[0];

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
          <h2 style="color: #333;">Hello ${candidate.name},</h2>
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

    // Get candidate details
    const candidateResult = await db.select({
      id: users.id,
      name: users.full_name,
      resume_url: users.resume_url
    })
    .from(users)
    .where(and(eq(users.id, parseInt(id)), eq(users.role, 'applicant')))
    .limit(1);

    if (candidateResult.length === 0) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    const candidate = candidateResult[0];

    if (!candidate.resume_url) {
      return res.status(404).json({ 
        message: 'Resume not found for this candidate' 
      });
    }

    // Handle different resume URL formats
    let resumePath;
    if (candidate.resume_url.startsWith('http')) {
      // External URL - redirect to the URL
      return res.redirect(candidate.resume_url);
    } else if (candidate.resume_url.startsWith('/uploads/')) {
      // Relative path from uploads
      resumePath = path.join(process.cwd(), candidate.resume_url.substring(1));
    } else if (candidate.resume_url.includes('uploads/')) {
      // Path includes uploads
      resumePath = path.join(process.cwd(), candidate.resume_url);
    } else {
      // Assume it's just a filename in resumes folder
      resumePath = path.join(process.cwd(), 'uploads', 'resumes', candidate.resume_url);
    }
    
    // Check if file exists and serve it
    if (fs.existsSync(resumePath)) {
      const fileExtension = path.extname(resumePath).toLowerCase();
      const fileName = `${candidate.name.replace(/[^a-zA-Z0-9]/g, '_')}_Resume${fileExtension}`;
      
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', fileExtension === '.pdf' ? 'application/pdf' : 'application/octet-stream');
      
      // Stream the file
      const fileStream = fs.createReadStream(resumePath);
      fileStream.pipe(res);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        res.status(500).json({ 
          message: 'Error reading resume file' 
        });
      });
    } else {
      // Check in applications folder as backup
      const backupPath = path.join(process.cwd(), 'uploads', 'applications', candidate.resume_url);
      if (fs.existsSync(backupPath)) {
        const fileExtension = path.extname(backupPath).toLowerCase();
        const fileName = `${candidate.name.replace(/[^a-zA-Z0-9]/g, '_')}_Resume${fileExtension}`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', fileExtension === '.pdf' ? 'application/pdf' : 'application/octet-stream');
        
        const fileStream = fs.createReadStream(backupPath);
        fileStream.pipe(res);
      } else {
        return res.status(404).json({
          message: 'Resume file not found on server',
          resume_url: candidate.resume_url,
          candidate_name: candidate.name
        });
      }
    }

  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ 
      message: 'Internal server error while downloading resume' 
    });
  }
};

// Get candidate statistics
export const getCandidateStats = async (req, res) => {
  try {
    // Total candidates
    const totalCandidatesResult = await db.select({ count: sql`COUNT(*)` })
      .from(users)
      .where(eq(users.role, 'applicant'));

    // Candidates by status
    const candidatesByStatusResult = await db.select({
      status: users.status,
      count: sql`COUNT(*)`
    })
    .from(users)
    .where(eq(users.role, 'applicant'))
    .groupBy(users.status);

    // Recent candidates (last 7 days)
    const recentCandidatesResult = await db.select({ count: sql`COUNT(*)` })
      .from(users)
      .where(
        and(
          eq(users.role, 'applicant'),
          sql`${users.created_at} >= datetime('now', '-7 days')`
        )
      );

    // Candidates by experience level
    const candidatesByExperienceResult = await db.select({
      experience_range: sql`
        CASE 
          WHEN ${users.experience_years} <= 2 THEN 'Entry Level (0-2 years)'
          WHEN ${users.experience_years} <= 5 THEN 'Mid Level (3-5 years)'
          WHEN ${users.experience_years} <= 10 THEN 'Senior Level (6-10 years)'
          ELSE 'Expert Level (10+ years)'
        END
      `,
      count: sql`COUNT(*)`
    })
    .from(users)
    .where(eq(users.role, 'applicant'))
    .groupBy(sql`
      CASE 
        WHEN ${users.experience_years} <= 2 THEN 'Entry Level (0-2 years)'
        WHEN ${users.experience_years} <= 5 THEN 'Mid Level (3-5 years)'
        WHEN ${users.experience_years} <= 10 THEN 'Senior Level (6-10 years)'
        ELSE 'Expert Level (10+ years)'
      END
    `);

    res.json({
      total_candidates: totalCandidatesResult[0].count,
      recent_candidates: recentCandidatesResult[0].count,
      candidates_by_status: candidatesByStatusResult,
      candidates_by_experience: candidatesByExperienceResult
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
      updated_at: new Date().toISOString()
    };

    if (notes) updateData.notes = notes;

    // Update candidates
    const updatedCandidates = await db.update(users)
      .set(updateData)
      .where(
        and(
          inArray(users.id, candidate_ids.map(id => parseInt(id))),
          eq(users.role, 'applicant')
        )
      )
      .returning();

    res.json({
      message: `${updatedCandidates.length} candidates updated successfully`,
      updated_count: updatedCandidates.length
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
