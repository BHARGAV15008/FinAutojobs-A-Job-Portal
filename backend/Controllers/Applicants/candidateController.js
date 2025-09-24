const mongoose = require("mongoose");
const { createTransport } = require("nodemailer");
const { Applicant: Candidate } = require("../models/Others");
const { Interview } = require("../models/Recruiters/jobs");
// const Message = require("../models/Message"); // Model not found

// View candidate details
exports.getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await Candidate.findById(candidateId).select("-password");

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving candidate details",
      error: error.message,
    });
  }
};

// Contact candidate via email
exports.sendEmail = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { subject, message } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Create email transporter
    const transporter = createTransport({
      // Configure your email service here
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject: subject,
      text: message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending email",
      error: error.message,
    });
  }
};

// Send internal message
exports.sendMessage = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { content } = req.body;
    const recruiterId = req.user.id;

    const message = new Message({
      sender: recruiterId,
      receiver: candidateId,
      content,
      messageType: "internal",
    });

    await message.save();

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};

// Schedule interview
exports.scheduleInterview = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const {
      scheduledAt,
      duration,
      interviewType,
      meetingLink,
      location,
      description,
      interviewerName,
    } = req.body;

    const interview = new Interview({
      candidate: candidateId,
      recruiter: req.user.id,
      scheduledAt,
      duration,
      interviewType,
      meetingLink,
      location,
      description,
      interviewerName,
    });

    await interview.save();

    // Send notification email to candidate
    const candidate = await Candidate.findById(candidateId);
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject: "Interview Scheduled",
      text: `Your interview has been scheduled for ${new Date(
        scheduledAt
      ).toLocaleString()}.\n\n${
        meetingLink ? `Meeting Link: ${meetingLink}` : `Location: ${location}`
      }\n\nInterview Type: ${interviewType}\nDuration: ${duration} minutes\n\nDescription: ${description}`,
    });

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error scheduling interview",
      error: error.message,
    });
  }
};

// Update interview schedule
exports.updateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const updateData = req.body;

    const interview = await Interview.findByIdAndUpdate(
      interviewId,
      updateData,
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Send notification email about rescheduling
    const candidate = await Candidate.findById(interview.candidate);
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject: "Interview Rescheduled",
      text: `Your interview has been rescheduled to ${new Date(
        interview.scheduledAt
      ).toLocaleString()}.\n\n${
        interview.meetingLink
          ? `Meeting Link: ${interview.meetingLink}`
          : `Location: ${interview.location}`
      }\n\nInterview Type: ${interview.interviewType}\nDuration: ${
        interview.duration
      } minutes\n\nDescription: ${interview.description}`,
    });

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating interview",
      error: error.message,
    });
  }
};

// Toggle shortlist status
exports.toggleShortlist = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.isShortlisted = !candidate.isShortlisted;
    await candidate.save();

    res.status(200).json({
      success: true,
      data: { isShortlisted: candidate.isShortlisted },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error toggling shortlist status",
      error: error.message,
    });
  }
};
