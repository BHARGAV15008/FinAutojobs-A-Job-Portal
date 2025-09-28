import express from 'express';
import Job from '../models/Job.js';
import { BaseUser, Applicant } from '../models/UserModels.js';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    const user = await BaseUser.findById(decoded.id || decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = {
      ...decoded,
      ...user.toObject(),
      userId: decoded.userId || user._id,
      _id: user._id
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Skill matching algorithm
const calculateSkillMatch = (applicantSkills, jobRequiredSkills) => {
  if (!applicantSkills || !jobRequiredSkills || jobRequiredSkills.length === 0) {
    return { matchPercentage: 0, matchedSkills: [], missingSkills: jobRequiredSkills || [] };
  }

  // Combine all applicant skills into a single array
  const allApplicantSkills = [
    ...(applicantSkills.primary || []),
    ...(applicantSkills.technical || []),
    ...(applicantSkills.soft || [])
  ].map(skill => skill.toLowerCase().trim());

  // Convert job required skills to lowercase for comparison
  const jobSkills = jobRequiredSkills.map(skill => skill.toLowerCase().trim());

  console.log(`🔍 SKILL COMPARISON:`);
  console.log(`🔍 Applicant skills: [${allApplicantSkills.join(', ')}]`);
  console.log(`🔍 Job required skills: [${jobSkills.join(', ')}]`);

  // Find matched skills with detailed logging
  const matchedSkills = jobSkills.filter(jobSkill => {
    const isMatched = allApplicantSkills.some(applicantSkill => {
      const exactMatch = applicantSkill === jobSkill;
      
      // Only allow partial matches if they are meaningful (avoid false positives)
      const meaningfulPartialMatch = (
        // Applicant skill contains job skill (e.g., "JavaScript Programming" contains "JavaScript")
        (applicantSkill.includes(jobSkill) && jobSkill.length > 4) ||
        // Job skill contains applicant skill (e.g., "Advanced Java" contains "Java")
        (jobSkill.includes(applicantSkill) && applicantSkill.length > 4)
      );
      
      // Very strict word matching - only for technical skills with exact word boundaries
      const strictWordMatch = applicantSkill.split(' ').some(word => 
        word.length > 4 && jobSkill.split(' ').some(jobWord => jobWord === word)
      ) || jobSkill.split(' ').some(word => 
        word.length > 4 && applicantSkill.split(' ').some(appWord => appWord === word)
      );
      
      const matched = exactMatch || meaningfulPartialMatch || strictWordMatch;
      
      if (matched) {
        console.log(`🔍 SKILL MATCH: "${applicantSkill}" matches "${jobSkill}" - Exact: ${exactMatch}, Partial: ${meaningfulPartialMatch}, Word: ${strictWordMatch}`);
      }
      
      return matched;
    });
    
    return isMatched;
  });

  // Find missing skills
  const missingSkills = jobSkills.filter(skill => !matchedSkills.includes(skill));

  // Calculate match percentage
  const matchPercentage = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 0;

  const result = {
    matchPercentage: Math.round(matchPercentage),
    matchedSkills: matchedSkills.map(skill => 
      jobRequiredSkills.find(originalSkill => originalSkill.toLowerCase() === skill)
    ),
    missingSkills: missingSkills.map(skill => 
      jobRequiredSkills.find(originalSkill => originalSkill.toLowerCase() === skill)
    ),
    totalRequired: jobSkills.length,
    totalMatched: matchedSkills.length
  };

  console.log(`🔍 SKILL MATCH RESULT: ${result.totalMatched}/${result.totalRequired} skills matched (${result.matchPercentage}%)`);
  console.log(`🔍 Matched: [${result.matchedSkills.join(', ')}]`);
  console.log(`🔍 Missing: [${result.missingSkills.join(', ')}]`);
  
  return result;
};

// Additional matching factors
const calculateLocationMatch = (applicantLocation, jobLocation) => {
  if (!applicantLocation || !jobLocation) return 0;
  
  const applicantCity = applicantLocation.city?.toLowerCase() || '';
  const jobLocationLower = jobLocation.toLowerCase();
  
  if (applicantCity && jobLocationLower.includes(applicantCity)) {
    return 100;
  }
  
  // Check for state/region matches
  const applicantState = applicantLocation.state?.toLowerCase() || '';
  if (applicantState && jobLocationLower.includes(applicantState)) {
    return 50;
  }
  
  return 0;
};

const calculateExperienceMatch = (applicantExperience, jobExperience) => {
  if (!jobExperience || (!jobExperience.minimum && !jobExperience.maximum)) return 100;
  
  const applicantYears = applicantExperience || 0;
  const minRequired = jobExperience.minimum || 0;
  const maxRequired = jobExperience.maximum || 50;
  
  if (applicantYears >= minRequired && applicantYears <= maxRequired) {
    return 100;
  } else if (applicantYears >= minRequired) {
    // Over-qualified but still good match
    return 80;
  } else {
    // Under-qualified - calculate how close they are
    const deficit = minRequired - applicantYears;
    return Math.max(0, 100 - (deficit * 20)); // Reduce by 20% for each year short
  }
};

// GET /api/recommendations/jobs - Get recommended jobs for applicant
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 ===== RECOMMENDATION REQUEST =====');
    console.log('🔍 User ID:', req.user._id);
    console.log('🔍 User Role:', req.user.role);
    
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only available for applicants'
      });
    }

    const { limit = 20, minMatchPercentage = 10 } = req.query;
    console.log('🔍 Query params - limit:', limit, 'minMatchPercentage:', minMatchPercentage);

    // Get applicant's full profile
    const applicant = await Applicant.findById(req.user._id);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant profile not found'
      });
    }
    
    console.log('🔍 Applicant found:', applicant.firstName, applicant.lastName);
    console.log('🔍 Applicant skills:', JSON.stringify(applicant.skills, null, 2));
    console.log('🔍 Applicant location:', JSON.stringify(applicant.currentLocation, null, 2));
    console.log('🔍 Applicant experience:', applicant.yearsOfExperience);

    // Get all active jobs
    const jobs = await Job.find({ 
      status: 'Active',  // Changed from 'active' to 'Active' to match your data
      applicationDeadline: { $gte: new Date() } // Only jobs that are still accepting applications
    }).lean();

    console.log('🔍 Found jobs:', jobs.length);
    if (jobs.length > 0) {
      console.log('🔍 First job example:', {
        title: jobs[0].jobTitle,
        skills: jobs[0].requiredSkills,
        status: jobs[0].status
      });
    }

    // Calculate match scores for each job
    const jobsWithScores = jobs.map(job => {
      console.log('🔍 Processing job:', job.jobTitle);
      console.log('🔍 Job required skills:', job.requiredSkills);
      
      const skillMatch = calculateSkillMatch(applicant.skills, job.requiredSkills);
      const locationMatch = calculateLocationMatch(applicant.currentLocation, job.location);
      const experienceMatch = calculateExperienceMatch(applicant.yearsOfExperience, job.experience);
      
      console.log('🔍 Skill match result:', skillMatch);
      console.log('🔍 Location match:', locationMatch);
      console.log('🔍 Experience match:', experienceMatch);

      // Calculate overall match score (weighted)
      const overallScore = (
        skillMatch.matchPercentage * 0.6 +  // Skills are most important (60%)
        experienceMatch * 0.25 +            // Experience is important (25%)
        locationMatch * 0.15                // Location is least important (15%)
      );

      console.log('🔍 Overall score calculated:', Math.round(overallScore));

      return {
        ...job,
        matchScore: {
          overall: Math.round(overallScore),
          skills: skillMatch,
          location: locationMatch,
          experience: experienceMatch
        }
      };
    });

    console.log('🔍 Jobs with scores:', jobsWithScores.length);
    console.log('🔍 Min match percentage required:', minMatchPercentage);

    // Filter jobs with minimum match percentage and MANDATORY skill match
    const recommendedJobs = jobsWithScores
      .filter(job => {
        const hasSkillMatch = job.matchScore.skills.matchPercentage > 0; // Must have at least 1 skill match
        const meetsOverallThreshold = job.matchScore.overall >= minMatchPercentage;
        
        // Additional check: Require meaningful skill match (at least 25% for cross-industry relevance)
        const hasMeaningfulSkillMatch = job.matchScore.skills.matchPercentage >= 25;
        
        const passes = hasSkillMatch && meetsOverallThreshold && hasMeaningfulSkillMatch;
        
        console.log(`🔍 Job "${job.jobTitle}" (${job.industry}) - Skills: ${job.matchScore.skills.matchPercentage}% - Overall: ${job.matchScore.overall}% - Meaningful Skills: ${hasMeaningfulSkillMatch} - Passes: ${passes}`);
        return passes;
      })
      .sort((a, b) => b.matchScore.overall - a.matchScore.overall)
      .slice(0, parseInt(limit));

    console.log('🔍 Final recommended jobs:', recommendedJobs.length);

    // Format response
    const formattedJobs = recommendedJobs.map(job => ({
      id: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      industry: job.industry,
      jobCategory: job.jobCategory,
      workArrangement: job.workArrangement,
      experience: job.experience,
      salary: job.salary,
      requiredSkills: job.requiredSkills,
      description: job.description,
      applicationDeadline: job.applicationDeadline,
      postedDate: job.createdAt,
      matchScore: job.matchScore,
      // Add recommendation reasons
      recommendationReasons: [
        ...(job.matchScore.skills.matchedSkills.length > 0 ? 
          [`${job.matchScore.skills.matchedSkills.length} matching skills: ${job.matchScore.skills.matchedSkills.slice(0, 3).join(', ')}`] : 
          []
        ),
        ...(job.matchScore.experience >= 80 ? ['Experience level matches'] : []),
        ...(job.matchScore.location >= 50 ? ['Location preference matches'] : [])
      ]
    }));

    res.json({
      success: true,
      data: {
        jobs: formattedJobs,
        totalFound: formattedJobs.length,
        applicantProfile: {
          skills: applicant.skills,
          location: applicant.currentLocation,
          experience: applicant.yearsOfExperience
        },
        filters: {
          minMatchPercentage: parseInt(minMatchPercentage),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job recommendations',
      error: error.message
    });
  }
});

// GET /api/recommendations/stats - Get recommendation statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only available for applicants'
      });
    }

    const applicant = await Applicant.findById(req.user._id);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant profile not found'
      });
    }

    // Get total active jobs
    const totalJobs = await Job.countDocuments({ 
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    });

    // Get jobs with any skill match
    const jobs = await Job.find({ 
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    }).lean();

    let highMatchJobs = 0;
    let mediumMatchJobs = 0;
    let lowMatchJobs = 0;

    jobs.forEach(job => {
      const skillMatch = calculateSkillMatch(applicant.skills, job.requiredSkills);
      if (skillMatch.matchPercentage >= 70) {
        highMatchJobs++;
      } else if (skillMatch.matchPercentage >= 30) {
        mediumMatchJobs++;
      } else if (skillMatch.matchPercentage > 0) {
        lowMatchJobs++;
      }
    });

    res.json({
      success: true,
      data: {
        totalActiveJobs: totalJobs,
        matchingJobs: {
          high: highMatchJobs,      // 70%+ match
          medium: mediumMatchJobs,  // 30-69% match
          low: lowMatchJobs         // 1-29% match
        },
        applicantSkills: {
          primary: applicant.skills?.primary || [],
          technical: applicant.skills?.technical || [],
          soft: applicant.skills?.soft || []
        }
      }
    });

  } catch (error) {
    console.error('Recommendation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation statistics',
      error: error.message
    });
  }
});

export default router;
