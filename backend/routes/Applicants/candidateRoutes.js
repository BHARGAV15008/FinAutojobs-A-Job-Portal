q qconst express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/Others/auth");
const {
  getCandidateDetails,
  sendEmail,
  sendMessage,
  scheduleInterview,
  updateInterview,
  toggleShortlist,
} = require("../Controllers/Applicants/candidateController");

// Protect all routes - require authentication
router.use(protect);
router.use(authorize("recruiter"));

// Get candidate details
router.get("/:candidateId", getCandidateDetails);

// Contact candidate via email
router.post("/:candidateId/email", sendEmail);

// Send internal message
router.post("/:candidateId/message", sendMessage);

// Schedule interview
router.post("/:candidateId/interview", scheduleInterview);

// Update interview
router.put("/interview/:interviewId", updateInterview);

// Toggle shortlist status
router.put("/:candidateId/shortlist", toggleShortlist);

module.exports = router;
