import express from 'express';
import Job from '../models/Job.js';
import { BaseUser, Applicant } from '../models/UserModels.js';

const router = express.Router();

// Helper function to check skill aliases and variations
const checkSkillAliases = (applicantSkill, jobSkill) => {
  const skillAliases = {
    // Programming Languages
    'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular', 'jquery', 'ecmascript', 'es6', 'es2015'],
    'js': ['javascript', 'node.js', 'nodejs', 'react', 'vue', 'angular', 'ecmascript'],
    'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy', 'py', 'python3'],
    'java': ['spring', 'hibernate', 'maven', 'gradle', 'jvm', 'jsp', 'servlet'],
    'c++': ['cpp', 'c plus plus', 'cplusplus'],
    'c#': ['csharp', 'c sharp', 'dotnet', '.net'],
    'php': ['laravel', 'symfony', 'codeigniter', 'wordpress'],
    
    // Frontend Frameworks
    'react': ['reactjs', 'react.js', 'javascript', 'js', 'jsx', 'react native'],
    'reactjs': ['react', 'react.js', 'javascript', 'jsx'],
    'vue': ['vuejs', 'vue.js', 'javascript', 'nuxt'],
    'angular': ['angularjs', 'javascript', 'typescript', 'ng'],
    'svelte': ['sveltekit', 'javascript'],
    
    // Backend Technologies
    'node.js': ['nodejs', 'node', 'javascript', 'js', 'express', 'npm'],
    'nodejs': ['node.js', 'node', 'javascript', 'express'],
    'express': ['expressjs', 'node.js', 'nodejs', 'javascript'],
    'django': ['python', 'web framework'],
    'flask': ['python', 'micro framework'],
    'spring': ['java', 'spring boot', 'springframework'],
    
    // Databases
    'mongodb': ['mongo', 'nosql', 'document database'],
    'mysql': ['sql', 'database', 'relational database'],
    'postgresql': ['postgres', 'sql', 'database', 'psql'],
    'redis': ['cache', 'in-memory database'],
    'sqlite': ['sql', 'database'],
    
    // Web Technologies
    'html': ['html5', 'markup', 'web development'],
    'css': ['css3', 'styling', 'sass', 'scss', 'less', 'stylesheets'],
    'sass': ['scss', 'css', 'preprocessor'],
    'scss': ['sass', 'css', 'preprocessor'],
    'bootstrap': ['css', 'framework', 'responsive'],
    'tailwind': ['tailwindcss', 'css', 'utility-first'],
    
    // Programming Concepts
    'typescript': ['ts', 'javascript', 'typed javascript'],
    'api': ['rest', 'restful', 'backend', 'web services', 'graphql'],
    'rest': ['api', 'restful', 'web services', 'http'],
    'graphql': ['api', 'query language'],
    'json': ['data format', 'api'],
    
    // Development Tools
    'git': ['github', 'version control', 'gitlab', 'bitbucket', 'vcs'],
    'github': ['git', 'version control', 'repository'],
    'docker': ['containerization', 'devops', 'containers'],
    'kubernetes': ['k8s', 'container orchestration', 'devops'],
    'jenkins': ['ci/cd', 'continuous integration', 'devops'],
    
    // Cloud & DevOps
    'aws': ['amazon web services', 'cloud', 'ec2', 's3'],
    'azure': ['microsoft azure', 'cloud'],
    'gcp': ['google cloud platform', 'cloud'],
    'cloud': ['aws', 'azure', 'gcp', 'cloud computing'],
    'devops': ['ci/cd', 'deployment', 'automation'],
    
    // Data & AI
    'machine learning': ['ml', 'ai', 'artificial intelligence', 'data science'],
    'artificial intelligence': ['ai', 'ml', 'machine learning'],
    'data science': ['data analysis', 'analytics', 'statistics', 'ml'],
    'pandas': ['python', 'data analysis'],
    'numpy': ['python', 'numerical computing'],
    'tensorflow': ['ml', 'deep learning', 'ai'],
    'pytorch': ['ml', 'deep learning', 'ai'],
    
    // Mobile Development
    'react native': ['react', 'mobile development', 'javascript'],
    'flutter': ['dart', 'mobile development'],
    'android': ['java', 'kotlin', 'mobile development'],
    'ios': ['swift', 'objective-c', 'mobile development'],
    
    // General Development
    'web development': ['frontend', 'backend', 'full stack', 'html', 'css', 'javascript'],
    'frontend': ['front-end', 'ui', 'web development', 'html', 'css', 'javascript'],
    'backend': ['back-end', 'server', 'api', 'database'],
    'full stack': ['fullstack', 'frontend', 'backend', 'web development'],
    'ui': ['user interface', 'frontend', 'design'],
    'ux': ['user experience', 'design'],
    
    // Testing
    'testing': ['unit testing', 'integration testing', 'qa'],
    'jest': ['javascript testing', 'testing'],
    'cypress': ['e2e testing', 'testing'],
    
    // Finance and Accounting Skills
    'financial analysis': ['finance', 'financial modeling', 'financial planning', 'budgeting', 'forecasting', 'financial reporting'],
    'finance': ['financial analysis', 'financial planning', 'budgeting', 'accounting'],
    'accounting': ['bookkeeping', 'financial reporting', 'tax preparation', 'audit', 'tally'],
    'investment analysis': ['portfolio management', 'asset management', 'equity research', 'valuation'],
    'risk assessment': ['risk management', 'credit analysis', 'compliance', 'regulatory', 'kyc', 'aml', 'regulatory compliance'],
    'risk management': ['risk assessment', 'compliance', 'regulatory'],
    'financial modeling': ['excel modeling', 'dcf', 'valuation models', 'financial analysis'],
    'budgeting': ['budget planning', 'cost control', 'financial planning', 'finance'],
    'taxation': ['tax planning', 'tax compliance', 'gst'],
    'audit': ['internal audit', 'external audit', 'compliance audit', 'accounting'],
    'banking': ['retail banking', 'corporate banking', 'investment banking', 'finance'],
    'insurance': ['underwriting', 'claims', 'actuarial'],
    'compliance': ['regulatory compliance', 'kyc', 'aml', 'risk management', 'regulatory'],
    'regulatory compliance': ['compliance', 'kyc', 'aml', 'risk assessment', 'regulatory'],
    'tally': ['accounting', 'bookkeeping', 'financial software'],
    'kyc/aml': ['compliance', 'regulatory', 'risk assessment', 'kyc', 'aml'],
    'kyc': ['compliance', 'regulatory', 'aml', 'risk assessment'],
    'aml': ['compliance', 'regulatory', 'kyc', 'risk assessment'],
    'regulatory': ['compliance', 'regulatory compliance', 'risk management'],
    
    // Business Skills
    'project management': ['pmp', 'agile', 'scrum', 'waterfall'],
    'data analysis': ['excel', 'sql', 'tableau', 'power bi', 'analytics'],
    'marketing': ['digital marketing', 'social media', 'content marketing', 'seo'],
    'sales': ['business development', 'lead generation', 'crm'],
    
    // Other
    'agile': ['scrum', 'methodology'],
    'scrum': ['agile', 'methodology'],
    'mvc': ['model view controller', 'architecture pattern']
  };

  // Check if applicant skill matches any aliases of job skill
  const jobAliases = skillAliases[jobSkill] || [];
  if (jobAliases.includes(applicantSkill)) {
    console.log(`🔍 ALIAS MATCH: "${applicantSkill}" matches "${jobSkill}" via aliases: [${jobAliases.join(', ')}]`);
    return true;
  }

  // Check if job skill matches any aliases of applicant skill
  const applicantAliases = skillAliases[applicantSkill] || [];
  if (applicantAliases.includes(jobSkill)) {
    console.log(`🔍 REVERSE ALIAS MATCH: "${applicantSkill}" matches "${jobSkill}" via applicant aliases: [${applicantAliases.join(', ')}]`);
    return true;
  }

  return false;
};

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

  // Combine all applicant skills and handle comma-separated strings
  let allApplicantSkills = [];
  
  // Handle different skill sources
  const skillSources = [
    applicantSkills.primary || [],
    applicantSkills.technical || [],
    applicantSkills.soft || [],
    Array.isArray(applicantSkills) ? applicantSkills : [],
    applicantSkills.skills_array || [],
    applicantSkills.primarySkills || []
  ];
  
  skillSources.forEach(source => {
    if (Array.isArray(source)) {
      source.forEach(skill => {
        if (typeof skill === 'string' && skill.includes(',')) {
          // Handle comma-separated skills like "JavaScript, React, Node.js"
          const splitSkills = skill.split(',').map(s => s.trim()).filter(s => s.length > 0);
          allApplicantSkills.push(...splitSkills);
        } else if (skill && typeof skill === 'string' && skill.trim().length > 0) {
          allApplicantSkills.push(skill.trim());
        }
      });
    }
  });
  
  // Remove duplicates, convert to lowercase, and filter empty values
  allApplicantSkills = [...new Set(allApplicantSkills)]
    .filter(skill => skill && skill.length > 0)
    .map(skill => skill.toLowerCase().trim());

  // Handle comma-separated job skills and convert to lowercase
  let jobSkills = [];
  jobRequiredSkills.forEach(skill => {
    if (typeof skill === 'string' && skill.includes(',')) {
      // Handle comma-separated job skills like "JavaScript, React, Node.js"
      const splitSkills = skill.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
      jobSkills.push(...splitSkills);
    } else if (skill && typeof skill === 'string') {
      jobSkills.push(skill.toLowerCase().trim());
    }
  });
  
  // Remove duplicates
  jobSkills = [...new Set(jobSkills)].filter(skill => skill.length > 0);

  console.log(`🔍 SKILL COMPARISON:`);
  console.log(`🔍 Applicant skills: [${allApplicantSkills.join(', ')}]`);
  console.log(`🔍 Job required skills: [${jobSkills.join(', ')}]`);

  // Find matched skills with more inclusive matching
  const matchedSkills = jobSkills.filter(jobSkill => {
    const isMatched = allApplicantSkills.some(applicantSkill => {
      const exactMatch = applicantSkill === jobSkill;
      
      // EXTREMELY inclusive partial matching - even 1 character overlap
      const partialMatch = (
        // Applicant skill contains job skill
        (applicantSkill.includes(jobSkill) && jobSkill.length > 1) ||
        // Job skill contains applicant skill
        (jobSkill.includes(applicantSkill) && applicantSkill.length > 1) ||
        // Case insensitive partial match
        (applicantSkill.toLowerCase().includes(jobSkill.toLowerCase()) && jobSkill.length > 1) ||
        (jobSkill.toLowerCase().includes(applicantSkill.toLowerCase()) && applicantSkill.length > 1)
      );
      
      // Word-based matching - very loose
      const wordMatch = applicantSkill.split(/[\s,.-]+/).some(word => 
        word.length > 1 && jobSkill.split(/[\s,.-]+/).some(jobWord => 
          jobWord.toLowerCase() === word.toLowerCase() ||
          jobWord.toLowerCase().includes(word.toLowerCase()) ||
          word.toLowerCase().includes(jobWord.toLowerCase())
        )
      ) || jobSkill.split(/[\s,.-]+/).some(word => 
        word.length > 1 && applicantSkill.split(/[\s,.-]+/).some(appWord => 
          appWord.toLowerCase() === word.toLowerCase() ||
          appWord.toLowerCase().includes(word.toLowerCase()) ||
          word.toLowerCase().includes(appWord.toLowerCase())
        )
      );
      
      // Common skill variations and aliases
      const aliasMatch = checkSkillAliases(applicantSkill, jobSkill);
      
      const matched = exactMatch || partialMatch || wordMatch || aliasMatch;
      
      if (matched) {
        console.log(`🔍 SKILL MATCH: "${applicantSkill}" matches "${jobSkill}" - Exact: ${exactMatch}, Partial: ${partialMatch}, Word: ${wordMatch}, Alias: ${aliasMatch}`);
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
    console.log('🔍 Applicant skills object:', JSON.stringify(applicant.skills, null, 2));
    console.log('🔍 Applicant skills_array:', applicant.skills_array);
    console.log('🔍 Applicant primarySkills:', applicant.primarySkills);
    console.log('🔍 Applicant location:', JSON.stringify(applicant.currentLocation, null, 2));
    console.log('🔍 Applicant experience:', applicant.yearsOfExperience);
    
    // Debug: Show all skill-related fields
    console.log('🔍 All skill fields on applicant:');
    Object.keys(applicant.toObject()).filter(key => key.toLowerCase().includes('skill')).forEach(key => {
      console.log(`🔍   ${key}:`, applicant[key]);
    });

    // Get ALL jobs - remove all restrictions to debug
    const jobs = await Job.find({}).lean();
    
    console.log('🔍 Total jobs in database:', jobs.length);
    
    // Filter only for truly active jobs but be very inclusive
    const activeJobs = jobs.filter(job => {
      const isActive = !job.status || 
                      job.status.toLowerCase() === 'active' || 
                      job.status === 'Active' ||
                      job.status === 'Published' ||
                      job.status === 'Open';
      
      const hasValidDeadline = !job.applicationDeadline || 
                              new Date(job.applicationDeadline) >= new Date() ||
                              new Date(job.applicationDeadline).getFullYear() > 2020; // Very lenient date check
      
      console.log(`🔍 Job "${job.jobTitle}" - Status: ${job.status} - Active: ${isActive} - Deadline: ${job.applicationDeadline} - Valid: ${hasValidDeadline}`);
      
      return isActive && hasValidDeadline;
    });

    console.log('🔍 Found active jobs:', activeJobs.length);
    if (activeJobs.length > 0) {
      console.log('🔍 First job example:', {
        title: activeJobs[0].jobTitle,
        skills: activeJobs[0].requiredSkills,
        status: activeJobs[0].status
      });
    }

    // Calculate match scores for each job
    const jobsWithScores = activeJobs.map(job => {
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

    // FILTER TO SHOW ONLY JOBS WITH SKILL MATCHES
    console.log('🔍 FILTERING JOBS - ONLY SHOWING JOBS WITH SKILL MATCHES');
    
    // Filter to show ONLY jobs that have at least one skill match
    const jobsWithSkillMatches = jobsWithScores.filter(job => {
      const hasMatchedSkills = job.matchScore.skills.matchedSkills && job.matchScore.skills.matchedSkills.length > 0;
      const hasSkillMatch = job.matchScore.skills.matchPercentage > 0;
      
      // Only include jobs that have actual skill matches
      const shouldInclude = hasMatchedSkills && hasSkillMatch;
      
      console.log(`🔍 Job "${job.jobTitle}" - Skills: ${job.matchScore.skills.matchPercentage}% - Matched Skills: ${job.matchScore.skills.matchedSkills?.length || 0}`);
      console.log(`🔍   Required Skills: [${job.requiredSkills?.join(', ') || 'none'}]`);
      
      if (hasMatchedSkills) {
        console.log(`🔍   ✅ MATCHED SKILLS: [${job.matchScore.skills.matchedSkills.join(', ')}] - INCLUDED`);
      } else {
        console.log(`🔍   ❌ NO SKILL MATCHES - EXCLUDED`);
      }
      
      return shouldInclude;
    });
    
    console.log(`🔍 FILTERING RESULT: ${jobsWithScores.length} total jobs → ${jobsWithSkillMatches.length} jobs with skill matches`);
    
    // Show only jobs with skill matches
    let recommendedJobs = jobsWithSkillMatches;
    
    recommendedJobs = recommendedJobs
      .sort((a, b) => {
        // Sort by skill match first, then overall score
        if (a.matchScore.skills.matchPercentage !== b.matchScore.skills.matchPercentage) {
          return b.matchScore.skills.matchPercentage - a.matchScore.skills.matchPercentage;
        }
        return b.matchScore.overall - a.matchScore.overall;
      })
      .slice(0, parseInt(limit));

    console.log('🔍 Final recommended jobs:', recommendedJobs.length);

    // Only show jobs with actual skill matches - no fallback jobs
    if (recommendedJobs.length === 0) {
      console.log('🔍 No skill-matched jobs found. Showing empty results (no fallback jobs).');
    }

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

// DEBUG endpoint to show all jobs without filtering
router.get('/debug/all-jobs', authenticateToken, async (req, res) => {
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

    // Get ALL jobs without any filtering
    const allJobs = await Job.find({}).lean();
    
    const jobsWithBasicInfo = allJobs.map(job => ({
      id: job._id,
      title: job.jobTitle,
      company: job.companyName,
      status: job.status,
      deadline: job.applicationDeadline,
      requiredSkills: job.requiredSkills,
      skillMatch: calculateSkillMatch(applicant.skills, job.requiredSkills)
    }));

    res.json({
      success: true,
      data: {
        totalJobs: allJobs.length,
        applicantSkills: applicant.skills,
        jobs: jobsWithBasicInfo.slice(0, 20) // Show first 20 for debugging
      }
    });

  } catch (error) {
    console.error('Debug all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug all jobs',
      error: error.message
    });
  }
});

// DEBUG endpoint to test skill matching
router.get('/debug/skills', authenticateToken, async (req, res) => {
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

    // Get a few sample jobs to test matching
    const sampleJobs = await Job.find({}).limit(5).lean();
    
    const debugInfo = {
      applicantSkills: {
        skills: applicant.skills,
        skills_array: applicant.skills_array,
        primarySkills: applicant.primarySkills,
        allSkillFields: Object.keys(applicant.toObject()).filter(key => key.toLowerCase().includes('skill'))
      },
      sampleJobs: sampleJobs.map(job => ({
        title: job.jobTitle,
        requiredSkills: job.requiredSkills,
        skillMatch: calculateSkillMatch(applicant.skills, job.requiredSkills)
      }))
    };

    res.json({
      success: true,
      data: debugInfo
    });

  } catch (error) {
    console.error('Debug skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug skills',
      error: error.message
    });
  }
});

export default router;
