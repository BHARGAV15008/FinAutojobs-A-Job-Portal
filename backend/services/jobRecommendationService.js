import Job from '../models/unified/Job.js';
import { Applicant } from '../models/UserModels.js';

/**
 * Job Recommendation Service
 * Provides intelligent job matching based on applicant profile
 */

class JobRecommendationService {
  
  /**
   * Get recommended jobs for an applicant
   * @param {string} applicantId - The applicant's user ID
   * @param {number} limit - Maximum number of recommendations (default: 10)
   * @returns {Promise<Array>} Array of recommended jobs with match scores
   */
  static async getRecommendedJobs(applicantId, limit = 10) {
    try {
      console.log('🔍 Getting job recommendations for applicant:', applicantId);
      
      // Get applicant profile
      const applicant = await Applicant.findOne({ 
        $or: [{ _id: applicantId }, { userId: applicantId }] 
      });
      
      if (!applicant) {
        throw new Error('Applicant not found');
      }
      
      console.log('🔍 Applicant profile loaded:', {
        skills: applicant.skills,
        education: applicant.education,
        experience: applicant.yearsOfExperience,
        location: applicant.currentLocation
      });
      
      // Get all active jobs
      const activeJobs = await Job.find({ 
        status: { $in: ['active', 'Active'] },
        applicationDeadline: { $gte: new Date() }
      }).populate('postedBy', 'firstName lastName companyInfo');
      
      console.log('🔍 Found active jobs:', activeJobs.length);
      
      // Calculate match scores for each job
      const jobsWithScores = activeJobs.map(job => {
        const matchScore = this.calculateMatchScore(applicant, job);
        return {
          ...job.toObject(),
          matchScore,
          matchReasons: this.getMatchReasons(applicant, job, matchScore)
        };
      });
      
      // Sort by match score (highest first) and limit results
      const recommendedJobs = jobsWithScores
        .filter(job => job.matchScore > 0) // Only include jobs with some match
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
      
      console.log('✅ Generated recommendations:', recommendedJobs.length);
      
      return recommendedJobs;
    } catch (error) {
      console.error('❌ Job recommendation error:', error);
      throw error;
    }
  }
  
  /**
   * Calculate match score between applicant and job
   * @param {Object} applicant - Applicant profile
   * @param {Object} job - Job posting
   * @returns {number} Match score (0-100)
   */
  static calculateMatchScore(applicant, job) {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    // 1. Skills matching (40% weight)
    const skillsScore = this.calculateSkillsMatch(applicant, job);
    totalScore += skillsScore * 0.4;
    maxPossibleScore += 40;
    
    // 2. Education matching (25% weight)
    const educationScore = this.calculateEducationMatch(applicant, job);
    totalScore += educationScore * 0.25;
    maxPossibleScore += 25;
    
    // 3. Experience matching (20% weight)
    const experienceScore = this.calculateExperienceMatch(applicant, job);
    totalScore += experienceScore * 0.2;
    maxPossibleScore += 20;
    
    // 4. Location matching (10% weight)
    const locationScore = this.calculateLocationMatch(applicant, job);
    totalScore += locationScore * 0.1;
    maxPossibleScore += 10;
    
    // 5. Job preferences matching (5% weight)
    const preferencesScore = this.calculatePreferencesMatch(applicant, job);
    totalScore += preferencesScore * 0.05;
    maxPossibleScore += 5;
    
    // Return percentage score
    return Math.round((totalScore / maxPossibleScore) * 100);
  }
  
  /**
   * Calculate skills match score
   */
  static calculateSkillsMatch(applicant, job) {
    const applicantSkills = this.extractSkills(applicant);
    const jobSkills = job.requiredSkills || job.skills || [];
    
    if (jobSkills.length === 0) return 50; // Neutral score if no skills specified
    if (applicantSkills.length === 0) return 0;
    
    const matchedSkills = jobSkills.filter(jobSkill => 
      applicantSkills.some(appSkill => 
        this.isSkillMatch(appSkill, jobSkill)
      )
    );
    
    return (matchedSkills.length / jobSkills.length) * 100;
  }
  
  /**
   * Calculate education match score
   */
  static calculateEducationMatch(applicant, job) {
    const applicantEducation = applicant.education || [];
    const jobEducation = job.educationRequirements || job.qualification;
    
    if (!jobEducation) return 50; // Neutral score if no education specified
    if (applicantEducation.length === 0) return 0;
    
    // Check for degree level matches
    const applicantDegrees = applicantEducation.map(edu => 
      (edu.degree || '').toLowerCase()
    );
    
    const jobEducationLower = jobEducation.toLowerCase();
    
    // Check for exact matches or related degrees
    for (const degree of applicantDegrees) {
      if (degree.includes('bachelor') && jobEducationLower.includes('bachelor')) return 100;
      if (degree.includes('master') && jobEducationLower.includes('master')) return 100;
      if (degree.includes('phd') && jobEducationLower.includes('phd')) return 100;
      if (degree.includes('diploma') && jobEducationLower.includes('diploma')) return 80;
    }
    
    // Partial matches
    for (const degree of applicantDegrees) {
      if (jobEducationLower.includes(degree) || degree.includes(jobEducationLower)) {
        return 70;
      }
    }
    
    return 30; // Some education but no clear match
  }
  
  /**
   * Calculate experience match score
   */
  static calculateExperienceMatch(applicant, job) {
    const applicantExp = applicant.yearsOfExperience || 0;
    const jobMinExp = job.experience?.minimum || job.experienceMin || 0;
    const jobMaxExp = job.experience?.maximum || job.experienceMax || 999;
    
    if (applicantExp >= jobMinExp && applicantExp <= jobMaxExp) {
      return 100; // Perfect match
    } else if (applicantExp >= jobMinExp) {
      return 80; // Over-qualified but still good
    } else {
      // Under-qualified - calculate how close they are
      const gap = jobMinExp - applicantExp;
      if (gap <= 1) return 60;
      if (gap <= 2) return 40;
      return 20;
    }
  }
  
  /**
   * Calculate location match score
   */
  static calculateLocationMatch(applicant, job) {
    const applicantLocation = applicant.currentLocation?.city?.toLowerCase() || '';
    const jobLocation = (job.location || '').toLowerCase();
    
    if (!jobLocation) return 50; // Neutral if no location specified
    if (!applicantLocation) return 50;
    
    // Check for remote work preference
    if (applicant.jobPreferences?.remoteWorkPreference && 
        (job.workArrangement || '').toLowerCase().includes('remote')) {
      return 100;
    }
    
    // Check for exact city match
    if (applicantLocation === jobLocation) return 100;
    
    // Check for partial matches (same state/region)
    if (applicantLocation.includes(jobLocation) || jobLocation.includes(applicantLocation)) {
      return 70;
    }
    
    // Check willingness to relocate
    if (applicant.jobPreferences?.willingToRelocate) return 60;
    
    return 20; // Different location, no remote, no relocation
  }
  
  /**
   * Calculate job preferences match score
   */
  static calculatePreferencesMatch(applicant, job) {
    let score = 50; // Base score
    
    const preferences = applicant.jobPreferences || {};
    
    // Check job type preferences
    if (preferences.preferredJobTypes && preferences.preferredJobTypes.length > 0) {
      const jobType = (job.jobType || job.type || '').toLowerCase();
      const matchesType = preferences.preferredJobTypes.some(prefType => 
        jobType.includes(prefType.toLowerCase())
      );
      if (matchesType) score += 30;
    }
    
    // Check salary expectations
    if (preferences.expectedSalary && job.salaryRange) {
      const expectedSalary = preferences.expectedSalary;
      const jobMinSalary = job.salaryRange.min || 0;
      const jobMaxSalary = job.salaryRange.max || 999999999;
      
      if (expectedSalary >= jobMinSalary && expectedSalary <= jobMaxSalary) {
        score += 20;
      }
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * Extract all skills from applicant profile
   */
  static extractSkills(applicant) {
    const skills = [];
    
    if (applicant.skills) {
      if (applicant.skills.primary) skills.push(...applicant.skills.primary);
      if (applicant.skills.technical) skills.push(...applicant.skills.technical);
      if (applicant.skills.soft) skills.push(...applicant.skills.soft);
    }
    
    if (applicant.primarySkills) skills.push(...applicant.primarySkills);
    if (applicant.skills_array) skills.push(...applicant.skills_array);
    
    return skills.map(skill => skill.toLowerCase().trim()).filter(Boolean);
  }
  
  /**
   * Check if two skills match (with fuzzy matching)
   */
  static isSkillMatch(appSkill, jobSkill) {
    const app = appSkill.toLowerCase().trim();
    const job = jobSkill.toLowerCase().trim();
    
    // Exact match
    if (app === job) return true;
    
    // Partial match
    if (app.includes(job) || job.includes(app)) return true;
    
    // Common skill aliases and related skills
    const skillAliases = {
      // Technology skills
      'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
      'python': ['django', 'flask', 'fastapi'],
      'java': ['spring', 'hibernate'],
      'react': ['reactjs', 'react.js'],
      'node.js': ['nodejs', 'node'],
      'mongodb': ['mongo'],
      'postgresql': ['postgres'],
      'machine learning': ['ml', 'ai', 'artificial intelligence'],
      
      // Finance and accounting skills
      'financial analysis': ['finance', 'financial modeling', 'financial planning', 'budgeting', 'forecasting', 'financial reporting'],
      'accounting': ['bookkeeping', 'financial reporting', 'tax preparation', 'audit', 'tally'],
      'investment analysis': ['portfolio management', 'asset management', 'equity research', 'valuation'],
      'risk assessment': ['risk management', 'credit analysis', 'compliance', 'regulatory', 'kyc', 'aml', 'regulatory compliance'],
      'financial modeling': ['excel modeling', 'dcf', 'valuation models'],
      'budgeting': ['budget planning', 'cost control', 'financial planning'],
      'taxation': ['tax planning', 'tax compliance', 'gst'],
      'audit': ['internal audit', 'external audit', 'compliance audit'],
      'banking': ['retail banking', 'corporate banking', 'investment banking'],
      'insurance': ['underwriting', 'claims', 'actuarial'],
      'compliance': ['regulatory compliance', 'kyc', 'aml', 'risk management'],
      'tally': ['accounting', 'bookkeeping', 'financial software'],
      'kyc/aml': ['compliance', 'regulatory', 'risk assessment', 'kyc', 'aml'],
      
      // Business skills
      'project management': ['pmp', 'agile', 'scrum', 'waterfall'],
      'data analysis': ['excel', 'sql', 'tableau', 'power bi', 'analytics'],
      'marketing': ['digital marketing', 'social media', 'content marketing', 'seo'],
      'sales': ['business development', 'lead generation', 'crm'],
      
      // Soft skills
      'communication': ['presentation', 'writing', 'public speaking'],
      'leadership': ['team management', 'people management', 'mentoring']
    };
    
    for (const [mainSkill, aliases] of Object.entries(skillAliases)) {
      if ((app === mainSkill && aliases.includes(job)) ||
          (job === mainSkill && aliases.includes(app)) ||
          (aliases.includes(app) && aliases.includes(job))) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get human-readable match reasons
   */
  static getMatchReasons(applicant, job, matchScore) {
    const reasons = [];
    
    // Skills match
    const applicantSkills = this.extractSkills(applicant);
    const jobSkills = job.requiredSkills || job.skills || [];
    const matchedSkills = jobSkills.filter(jobSkill => 
      applicantSkills.some(appSkill => this.isSkillMatch(appSkill, jobSkill))
    );
    
    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length} matching skills: ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    
    // Experience match
    const applicantExp = applicant.yearsOfExperience || 0;
    const jobMinExp = job.experience?.minimum || job.experienceMin || 0;
    
    if (applicantExp >= jobMinExp) {
      reasons.push(`${applicantExp} years experience (requires ${jobMinExp}+)`);
    }
    
    // Location match
    const applicantLocation = applicant.currentLocation?.city || '';
    const jobLocation = job.location || '';
    
    if (applicantLocation.toLowerCase() === jobLocation.toLowerCase()) {
      reasons.push(`Same location: ${jobLocation}`);
    } else if (applicant.jobPreferences?.remoteWorkPreference && 
               (job.workArrangement || '').toLowerCase().includes('remote')) {
      reasons.push('Remote work available');
    }
    
    // Education match
    if (applicant.education && applicant.education.length > 0) {
      const degree = applicant.education[0].degree;
      if (degree) {
        reasons.push(`Education: ${degree}`);
      }
    }
    
    return reasons;
  }
}

export default JobRecommendationService;
