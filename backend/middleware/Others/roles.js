export const isRecruiter = (req, res, next) => {
  if (req.user && (req.user.role === 'recruiter' || req.user.role === 'employer')) {
    next();
  } else {
    res.status(403).json({
      error: 'Access denied',
      message: 'This action requires recruiter privileges'
    });
  }
};

export const isApplicant = (req, res, next) => {
  if (req.user && req.user.role === 'applicant') {
    next();
  } else {
    res.status(403).json({
      error: 'Access denied',
      message: 'This action requires applicant privileges'
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      error: 'Access denied',
      message: 'This action requires administrator privileges'
    });
  }
};
