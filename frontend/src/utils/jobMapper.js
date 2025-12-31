/**
 * Utility to map backend job objects to frontend job structures
 * used across different pages (JobsPage, HomePage, etc.)
 */
export const mapBackendJobToFrontend = (job) => {
  if (!job) return null;

  // Handle nested salary object
  const getSalaryDisplay = (salary) => {
    if (!salary) return "Not disclosed";
    if (typeof salary === 'string') return salary;
    
    const { minimum, maximum, min, max, currency, period, type } = salary;
    if (type === 'Negotiable') return "Negotiable";
    
    const curr = currency || 'INR';
    const per = period || 'Yearly';
    
    const finalMin = minimum !== undefined ? minimum : min;
    const finalMax = maximum !== undefined ? maximum : max;
    
    if (finalMin !== undefined && finalMax !== undefined) {
      return `${curr} ${finalMin.toLocaleString()} - ${finalMax.toLocaleString()} ${per}`;
    } else if (finalMin !== undefined) {
      return `${curr} ${finalMin.toLocaleString()}+ ${per}`;
    }
    
    return "Not disclosed";
  };

  // Handle experience object
  const getExperienceDisplay = (exp) => {
    if (!exp) return "Not specified";
    if (typeof exp === 'string') return exp;
    
    const { minimum, maximum, min, max } = exp;
    
    const finalMin = minimum !== undefined ? minimum : min;
    const finalMax = maximum !== undefined ? maximum : max;

    if (finalMin !== undefined && finalMax !== undefined) {
      return `${finalMin}-${finalMax} years`;
    } else if (finalMin !== undefined) {
      return `${finalMin}+ years`;
    }
    
    return "Not specified";
  };

  return {
    ...job,
    _id: job._id || job.jobId || job.id,
    id: job.jobId || job._id || job.id,
    title: job.jobTitle || job.title,
    company: job.companyName || job.company,
    location: job.location,
    vacancy: job.vacancy || job.vacancies || job.openings || 1,
    type: job.jobType || job.type || "Full Time",
    workMode: job.workArrangement || job.workMode || "On-site",
    salary: job.formattedSalary || getSalaryDisplay(job.salary),
    experience: getExperienceDisplay(job.experience),
    skills: job.requiredSkills || job.skills || [],
    description: job.jobDescription || job.description,
    postedAt: job.createdAt ? (() => {
      const posted = new Date(job.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return posted.toLocaleDateString();
    })() : "Recently"
  };
};
