import { JobApplication, Job } from '../models/Recruiters/jobs/index.js';
import { User } from '../models/Others/index.js';
import { NotificationService } from '../../services/notifications.js';

// Apply to a job
export const applyToJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId, coverLetter, resumeUrl } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);

    if (!job || job.status !== 'active') {
      return res.status(404).json({ message: 'Job not found or no longer active' });
    }

    if (job.expiresAt && job.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    const existingApplication = await JobApplication.findOne({ 'applicant.applicantId': userId, 'job.jobId': jobId });

    if (existingApplication) {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }

    const application = new JobApplication({
      applicant: { applicantId: userId },
      job: { jobId: jobId },
      coverLetter,
      documents: { resume: resumeUrl }
    });

    await application.save();

    // Send notification to recruiter about new application
    try {
      await NotificationService.notifyApplicationSubmitted(
        application._id,
        jobId,
        userId
      );
    } catch (notificationError) {
      console.error('Error sending application notification:', notificationError);
      // Don't fail the application if notification fails
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ 
      message: 'Internal server error while submitting application' 
    });
  }
};

// Get all applications (for recruiters/employers)
export const getAllApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      jobId,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (jobId) {
      query['job.jobId'] = jobId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      // This requires a text index on the User model for fields like name and email
      const users = await User.find({ $text: { $search: search } }).select('_id');
      const userIds = users.map(user => user._id);
      query['applicant.applicantId'] = { $in: userIds };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const applications = await JobApplication.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('applicant.applicantId', 'firstName lastName email')
      .populate('job.jobId', 'title');

    const total = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      applications,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNum,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching applications' 
    });
  }
};

// Get single application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findById(id)
      .populate('applicant.applicantId', '-password')
      .populate({
        path: 'job.jobId',
        populate: {
          path: 'company.companyId',
          select: 'name logo'
        }
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ application });

  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching application' 
    });
  }
};

// Update application status (for recruiters/employers)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true, runValidators: true }
    ).populate('applicant.applicantId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Send notification to applicant about status change
    try {
      await NotificationService.notifyApplicationStatusChanged(
        application._id,
        status,
        application.applicant.applicantId._id,
        req.user.userId
      );
    } catch (notificationError) {
      console.error('Error sending status change notification:', notificationError);
      // Don't fail the update if notification fails
    }

    res.json({
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating application status' 
    });
  }
};

// Delete application (for job seekers)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const application = await JobApplication.findOneAndDelete({ _id: id, 'applicant.applicantId': userId });

    if (!application) {
      return res.status(404).json({ message: 'Application not found or you do not have permission to delete it' });
    }

    res.json({ message: 'Application deleted successfully' });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ 
      message: 'Internal server error while deleting application' 
    });
  }
};

// Get application statistics
export const getApplicationStats = async (req, res) => {
  try {
    const { jobId } = req.query;
    const match = {};
    if (jobId) {
      match['job.jobId'] = mongoose.Types.ObjectId(jobId);
    }

    const stats = await JobApplication.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total_applications: { $sum: '$count' },
          applications_by_status: { $push: { k: '$_id', v: '$count' } }
        }
      },
      {
        $project: {
          _id: 0,
          total_applications: 1,
          applications_by_status: { $arrayToObject: '$applications_by_status' }
        }
      }
    ]);

    res.json(stats[0] || { total_applications: 0, applications_by_status: {} });

  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching application statistics' 
    });
  }
};

// Bulk update applications (for recruiters/employers)
export const bulkUpdateApplications = async (req, res) => {
  try {
    const { applicationIds, status, notes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ message: 'Application IDs are required' });
    }

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    if (notes) {
      updateData.notes = notes;
    }

    const result = await JobApplication.updateMany(
      { _id: { $in: applicationIds } },
      { $set: updateData }
    );

    res.json({
      message: `${result.modifiedCount} applications updated successfully`,
      updated_count: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update applications error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating applications' 
    });
  }
};

// Export aliases for route compatibility
export const getApplicationsByJob = getAllApplications;
