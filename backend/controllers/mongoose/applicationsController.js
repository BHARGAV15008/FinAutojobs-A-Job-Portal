/**
 * Applications Controller
 * 
 * Handles job application management, status updates, and application-related operations
 * using Mongoose models and comprehensive application schemas.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import { getJobModel } from '../../models/schemas/jobs/JobFactory.js';
import { trackActivity } from '../../models/schemas/activities/ActivityFactory.js';
import { notificationManager } from '../../models/schemas/system/SystemFactory.js';

// Get applications (different views for different roles)
export const getApplications = async (req, res) => {
  try {
    const { userId, userRole } = req.user;
    const {
      page = 1,
      limit = 20,
      status,
      jobId,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const ApplicationModel = getJobModel('application');
    
    // Build query based on user role
    let query = {};
    
    if (userRole === 'applicant') {
      // Applicants see their own applications
      query['applicant.applicantId'] = userId;
    } else if (userRole === 'recruiter') {
      // Recruiters see applications for their jobs
      query['recruiter.recruiterId'] = userId;
    } else if (userRole === 'admin') {
      // Admins see all applications (no additional filter)
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view applications'
      });
    }

    // Add additional filters
    if (status) {
      query.status = { $in: status.split(',') };
    }
    if (jobId) {
      query['job.jobId'] = jobId;
    }

    // Build options
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    // Execute query
    const applications = await ApplicationModel.find(query, null, options)
      .populate('job.jobId', 'title company status')
      .populate('applicant.applicantId', 'firstName lastName email profilePicture')
      .populate('recruiter.recruiterId', 'firstName lastName email');

    const totalCount = await ApplicationModel.countDocuments(query);

    // Track applications view activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'applications_view',
        category: 'application',
        action: 'Viewed applications',
        description: `Viewed applications list (${applications.length} results)`
      },
      context: {
        filters: { status, jobId },
        results: {
          count: applications.length,
          totalCount,
          page: parseInt(page)
        }
      }
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasMore: (parseInt(page) * parseInt(limit)) < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching applications'
    });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { userId, userRole } = req.user;

    const ApplicationModel = getJobModel('application');
    const application = await ApplicationModel.findById(applicationId)
      .populate('job.jobId', 'title company requirements benefits')
      .populate('applicant.applicantId', 'firstName lastName email phone profilePicture skills experience')
      .populate('recruiter.recruiterId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user can view this application
    const canView = 
      userRole === 'admin' ||
      (userRole === 'applicant' && application.applicant.applicantId.toString() === userId) ||
      (userRole === 'recruiter' && application.recruiter.recruiterId.toString() === userId);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this application'
      });
    }

    // Track application view activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'application_view',
        category: 'application',
        action: 'Viewed application details',
        description: `Viewed application for: ${application.job.title}`
      },
      context: {
        resource: {
          type: 'application',
          id: application._id.toString(),
          jobTitle: application.job.title
        }
      }
    });

    res.json({
      success: true,
      data: {
        application: application.toObject()
      }
    });

  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching application'
    });
  }
};

// Update application status (Recruiter/Admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback, notes } = req.body;
    const { userId, userRole } = req.user;

    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters and admins can update application status'
      });
    }

    const ApplicationModel = getJobModel('application');
    const application = await ApplicationModel.findById(applicationId)
      .populate('applicant.applicantId', 'firstName lastName email')
      .populate('job.jobId', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if recruiter can update this application
    if (userRole !== 'admin' && application.recruiter.recruiterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your own jobs'
      });
    }

    // Validate status
    const validStatuses = ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update application
    const previousStatus = application.status;
    application.status = status;
    application.lastModifiedAt = new Date();

    // Add status history entry
    application.statusHistory.push({
      status,
      changedBy: {
        userId,
        role: userRole,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      changedAt: new Date(),
      feedback,
      notes
    });

    // Update specific status dates
    if (status === 'under_review' && !application.reviewedAt) {
      application.reviewedAt = new Date();
    } else if (status === 'shortlisted' && !application.shortlistedAt) {
      application.shortlistedAt = new Date();
    } else if (status === 'interviewed' && !application.interviewedAt) {
      application.interviewedAt = new Date();
    } else if (status === 'hired' && !application.hiredAt) {
      application.hiredAt = new Date();
    } else if (status === 'rejected' && !application.rejectedAt) {
      application.rejectedAt = new Date();
    }

    await application.save();

    // Track status update activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'application_status_update',
        category: 'application',
        action: 'Updated application status',
        description: `Changed application status from ${previousStatus} to ${status}`
      },
      context: {
        resource: {
          type: 'application',
          id: application._id.toString(),
          jobTitle: application.job.title
        },
        changes: {
          previousStatus,
          newStatus: status,
          feedback,
          notes
        }
      }
    });

    // Send notification to applicant
    const statusMessages = {
      under_review: 'Your application is now under review',
      shortlisted: 'Congratulations! You have been shortlisted',
      interview_scheduled: 'An interview has been scheduled for you',
      interviewed: 'Thank you for the interview',
      offered: 'Congratulations! You have received a job offer',
      hired: 'Congratulations! You have been hired',
      rejected: 'Thank you for your application'
    };

    if (statusMessages[status]) {
      await notificationManager.send({
        recipient: {
          userId: application.applicant.applicantId._id,
          role: 'applicant',
          email: application.applicant.applicantId.email,
          name: `${application.applicant.applicantId.firstName} ${application.applicant.applicantId.lastName}`
        },
        content: {
          type: 'application_status_update',
          category: 'application',
          priority: ['offered', 'hired', 'shortlisted'].includes(status) ? 'high' : 'medium',
          title: 'Application Status Update',
          message: `${statusMessages[status]} for the position: ${application.job.title}`,
          actionText: 'View Application',
          actionUrl: `/applications/${application._id}`
        },
        context: {
          resourceType: 'application',
          resourceId: application._id.toString(),
          status
        }
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        application: application.toObject()
      }
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating application status'
    });
  }
};

// Withdraw application (Applicant only)
export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;
    const { userId, userRole } = req.user;

    if (userRole !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can withdraw their applications'
      });
    }

    const ApplicationModel = getJobModel('application');
    const application = await ApplicationModel.findById(applicationId)
      .populate('job.jobId', 'title')
      .populate('recruiter.recruiterId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if applicant owns this application
    if (application.applicant.applicantId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications'
      });
    }

    // Check if application can be withdrawn
    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'This application cannot be withdrawn'
      });
    }

    // Update application status
    const previousStatus = application.status;
    application.status = 'withdrawn';
    application.withdrawnAt = new Date();
    application.lastModifiedAt = new Date();

    // Add status history entry
    application.statusHistory.push({
      status: 'withdrawn',
      changedBy: {
        userId,
        role: userRole,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      changedAt: new Date(),
      notes: reason || 'Application withdrawn by applicant'
    });

    await application.save();

    // Track withdrawal activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'application_withdraw',
        category: 'application',
        action: 'Withdrew application',
        description: `Withdrew application for: ${application.job.title}`
      },
      context: {
        resource: {
          type: 'application',
          id: application._id.toString(),
          jobTitle: application.job.title
        },
        reason
      }
    });

    // Send notification to recruiter
    await notificationManager.send({
      recipient: {
        userId: application.recruiter.recruiterId._id,
        role: 'recruiter',
        email: application.recruiter.recruiterId.email,
        name: `${application.recruiter.recruiterId.firstName} ${application.recruiter.recruiterId.lastName}`
      },
      content: {
        type: 'application_withdrawn',
        category: 'application',
        priority: 'low',
        title: 'Application Withdrawn',
        message: `${req.user.firstName} ${req.user.lastName} has withdrawn their application for: ${application.job.title}`,
        actionText: 'View Application',
        actionUrl: `/applications/${application._id}`
      },
      context: {
        resourceType: 'application',
        resourceId: application._id.toString()
      }
    });

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: {
        application: application.toObject()
      }
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while withdrawing application'
    });
  }
};

// Get application statistics
export const getApplicationStats = async (req, res) => {
  try {
    const { userId, userRole } = req.user;
    const { jobId, period = '30d' } = req.query;

    const ApplicationModel = getJobModel('application');
    
    // Build base query based on user role
    let baseQuery = {};
    
    if (userRole === 'applicant') {
      baseQuery['applicant.applicantId'] = userId;
    } else if (userRole === 'recruiter') {
      baseQuery['recruiter.recruiterId'] = userId;
    } else if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view application statistics'
      });
    }

    if (jobId) {
      baseQuery['job.jobId'] = jobId;
    }

    // Calculate date range
    const periodDays = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get statistics
    const stats = await ApplicationModel.aggregate([
      { $match: { ...baseQuery, submittedAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          statusBreakdown: {
            $push: '$status'
          },
          averageResponseTime: {
            $avg: {
              $subtract: [
                { $ifNull: ['$reviewedAt', new Date()] },
                '$submittedAt'
              ]
            }
          }
        }
      },
      {
        $project: {
          totalApplications: 1,
          averageResponseTime: { $divide: ['$averageResponseTime', 1000 * 60 * 60 * 24] }, // Convert to days
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: {
                  $setUnion: ['$statusBreakdown', []]
                },
                as: 'status',
                in: {
                  k: '$$status',
                  v: {
                    $size: {
                      $filter: {
                        input: '$statusBreakdown',
                        cond: { $eq: ['$$this', '$$status'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);

    // Get trend data (daily applications over the period)
    const trendData = await ApplicationModel.aggregate([
      { $match: { ...baseQuery, submittedAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$submittedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = stats[0] || {
      totalApplications: 0,
      statusCounts: {},
      averageResponseTime: 0
    };

    res.json({
      success: true,
      data: {
        period: `${periodDays} days`,
        statistics: result,
        trend: trendData,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching application statistics'
    });
  }
};

// Bulk update applications (Admin/Recruiter only)
export const bulkUpdateApplications = async (req, res) => {
  try {
    const { applicationIds, status, feedback, notes } = req.body;
    const { userId, userRole } = req.user;

    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters and admins can bulk update applications'
      });
    }

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs are required'
      });
    }

    const ApplicationModel = getJobModel('application');
    
    // Build query
    let query = { _id: { $in: applicationIds } };
    
    // If recruiter, only allow updating their own job applications
    if (userRole === 'recruiter') {
      query['recruiter.recruiterId'] = userId;
    }

    // Find applications to update
    const applications = await ApplicationModel.find(query);
    
    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No applications found to update'
      });
    }

    // Update each application
    const updatePromises = applications.map(async (application) => {
      application.status = status;
      application.lastModifiedAt = new Date();
      
      // Add status history entry
      application.statusHistory.push({
        status,
        changedBy: {
          userId,
          role: userRole,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        changedAt: new Date(),
        feedback,
        notes: notes || 'Bulk status update'
      });

      return application.save();
    });

    await Promise.all(updatePromises);

    // Track bulk update activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'application_bulk_update',
        category: 'application',
        action: 'Bulk updated applications',
        description: `Updated ${applications.length} applications to status: ${status}`
      },
      context: {
        bulkUpdate: {
          applicationCount: applications.length,
          newStatus: status,
          feedback,
          notes
        }
      }
    });

    res.json({
      success: true,
      message: `Successfully updated ${applications.length} applications`,
      data: {
        updatedCount: applications.length,
        status
      }
    });

  } catch (error) {
    console.error('Bulk update applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while bulk updating applications'
    });
  }
};

export default {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
  bulkUpdateApplications
};
