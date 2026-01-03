import express from "express";
import Company from "../models/Company.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import multer from "multer";
import s3Service from "../services/s3Service.js";
import emailService from "../services/emailService.js";
import User from "../models/User.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images and PDF files are allowed"));
  },
});

// @route   GET /api/companies
// @desc    Get all companies (public)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      industry,
      location,
      size,
      verified,
      search,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const query = { status: "active" };

    if (industry) query.industry = industry;
    if (size) query.size = size;
    if (location) query["headquarters.city"] = new RegExp(location, "i");
    if (verified === "true") query["verificationStatus.isVerified"] = true;
    if (search) {
      query.$text = { $search: search };
    }

    const sortOption = { [sort]: order === "desc" ? -1 : 1 };

    const companies = await Company.find(query)
      .select("-reviews -analytics -seo")
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("recruiter", "firstName lastName email")
      .lean();

    const count = await Company.countDocuments(query);

    res.json({
      companies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate("recruiter", "firstName lastName email phone")
      .populate("reviews.userId", "firstName lastName profileImage");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Increment page views
    company.analytics.pageViews += 1;
    await company.save();

    res.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/companies
// @desc    Create/Register a new company (Recruiter)
// @access  Private (Recruiter only)
router.post(
  "/",
  authenticateToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      if (req.user.role !== "recruiter" && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only recruiters can create companies" });
      }

      const companyData = JSON.parse(req.body.companyData || "{}");
      companyData.recruiter = req.user.userId;
      companyData.recruiters = [{ userId: req.user.userId, role: "admin" }];

      // Handle file uploads
      if (req.files) {
        if (req.files.logo) {
          const logoFile = req.files.logo[0];
          const logoUpload = await s3Service.uploadFile(
            logoFile.buffer,
            logoFile.originalname,
            logoFile.mimetype,
            req.user.userId,
            "company-logos",
            { name: companyData.name }
          );
          companyData.logo = logoUpload.url;
        }

        if (req.files.coverImage) {
          const coverFile = req.files.coverImage[0];
          const coverUpload = await s3Service.uploadFile(
            coverFile.buffer,
            coverFile.originalname,
            coverFile.mimetype,
            req.user.userId,
            "company-covers",
            { name: companyData.name }
          );
          companyData.coverImage = coverUpload.url;
        }

        if (req.files.documents) {
          companyData.verificationStatus = companyData.verificationStatus || {};
          companyData.verificationStatus.documentsSubmitted = [];

          for (const doc of req.files.documents) {
            const docUpload = await s3Service.uploadFile(
              doc.buffer,
              doc.originalname,
              doc.mimetype,
              req.user.userId,
              "company-documents",
              { name: companyData.name }
            );
            companyData.verificationStatus.documentsSubmitted.push({
              type: doc.fieldname,
              url: docUpload.url,
            });
          }
        }
      }

      const company = new Company(companyData);
      await company.save();

      // Send confirmation email to recruiter
      try {
        const recruiter = await User.findById(req.user.userId);
        if (recruiter && recruiter.email) {
          await emailService.sendCompanySubmittedEmail({
            recruiterEmail: recruiter.email,
            recruiterName:
              `${recruiter.firstName || ""} ${
                recruiter.lastName || ""
              }`.trim() || "Recruiter",
            companyName: company.name,
            industry: company.industry,
            location: `${company.headquarters?.city || ""}, ${
              company.headquarters?.country || ""
            }`.trim(),
            submissionDate: company.createdAt,
            referenceId: company._id.toString(),
          });
          console.log("📧 Company submission email sent successfully");
        }
      } catch (emailError) {
        console.error(
          "⚠️ Failed to send submission email:",
          emailError.message
        );
        // Don't fail the request if email fails
      }

      res.status(201).json({
        message:
          "Company registered successfully. Awaiting admin verification.",
        company,
      });
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   PUT /api/companies/:id
// @desc    Update company details
// @access  Private (Company admin/recruiter)
router.put(
  "/:id",
  authenticateToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const company = await Company.findById(req.params.id);

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Check authorization
      const isCompanyAdmin = company.recruiters.some(
        (r) => r.userId.toString() === req.user.userId && r.role === "admin"
      );

      if (!isCompanyAdmin && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Not authorized to update this company" });
      }

      const updateData = JSON.parse(req.body.companyData || "{}");

      // Handle file uploads
      if (req.files) {
        if (req.files.logo) {
          const logoFile = req.files.logo[0];
          const logoUpload = await s3Service.uploadFile(
            logoFile.buffer,
            logoFile.originalname,
            logoFile.mimetype,
            req.user.userId,
            "company-logos",
            { name: company.name }
          );
          updateData.logo = logoUpload.url;
        }

        if (req.files.coverImage) {
          const coverFile = req.files.coverImage[0];
          const coverUpload = await s3Service.uploadFile(
            coverFile.buffer,
            coverFile.originalname,
            coverFile.mimetype,
            req.user.userId,
            "company-covers",
            { name: company.name }
          );
          updateData.coverImage = coverUpload.url;
        }
      }

      Object.assign(company, updateData);
      await company.save();

      res.json({ message: "Company updated successfully", company });
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/companies/:id/review
// @desc    Add company review
// @access  Private
router.post("/:id/review", authenticateToken, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { rating, title, review, pros, cons } = req.body;

    // Check if user already reviewed
    const existingReview = company.reviews.find(
      (r) => r.userId.toString() === req.user.userId
    );

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this company" });
    }

    company.reviews.push({
      userId: req.user.userId,
      rating,
      title,
      review,
      pros: pros || [],
      cons: cons || [],
    });

    // Update stats
    company.stats.totalReviews = company.reviews.length;
    company.stats.averageRating = company.calculateAverageRating();

    await company.save();

    res.json({ message: "Review added successfully", company });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin-only routes
// @route   GET /api/companies/admin/all
// @desc    Get all companies for admin
// @access  Private (Admin only)
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status, verified, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (verified === "true") query["verificationStatus.isVerified"] = true;
    if (verified === "false") query["verificationStatus.isVerified"] = false;

    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("recruiter", "firstName lastName email phone")
      .lean();

    const count = await Company.countDocuments(query);

    res.json({
      companies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/companies/admin/:id/verify
// @desc    Verify a company
// @access  Private (Admin only)
router.put("/admin/:id/verify", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { notes } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        "verificationStatus.isVerified": true,
        "verificationStatus.verifiedAt": new Date(),
        "verificationStatus.verifiedBy": req.user.userId,
        "verificationStatus.verificationNotes": notes,
        status: "active",
      },
      { new: true }
    ).populate("recruiter", "email firstName lastName");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Send verification success email to recruiter
    try {
      if (company.recruiter && company.recruiter.email) {
        await emailService.sendCompanyVerifiedEmail({
          recruiterEmail: company.recruiter.email,
          recruiterName:
            `${company.recruiter.firstName || ""} ${
              company.recruiter.lastName || ""
            }`.trim() || "Recruiter",
          companyName: company.name,
          industry: company.industry,
          location: `${company.headquarters?.city || ""}, ${
            company.headquarters?.country || ""
          }`.trim(),
          verificationDate: company.verificationStatus.verifiedAt,
          adminNotes: notes,
        });
        console.log("📧 Company verification email sent successfully");
      }
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send verification email:",
        emailError.message
      );
      // Don't fail the request if email fails
    }

    res.json({ message: "Company verified successfully", company });
  } catch (error) {
    console.error("Error verifying company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/companies/admin/:id/reject
// @desc    Reject a company verification
// @access  Private (Admin only)
router.put("/admin/:id/reject", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { reason } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        "verificationStatus.isVerified": false,
        "verificationStatus.verificationNotes": reason,
        status: "rejected",
      },
      { new: true }
    ).populate("recruiter", "email firstName lastName");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Send rejection email to recruiter
    try {
      if (company.recruiter && company.recruiter.email) {
        await emailService.sendCompanyRejectedEmail({
          recruiterEmail: company.recruiter.email,
          recruiterName:
            `${company.recruiter.firstName || ""} ${
              company.recruiter.lastName || ""
            }`.trim() || "Recruiter",
          companyName: company.name,
          submissionDate: company.createdAt,
          reviewDate: new Date(),
          rejectionReason: reason,
        });
        console.log("📧 Company rejection email sent successfully");
      }
    } catch (emailError) {
      console.error("⚠️ Failed to send rejection email:", emailError.message);
      // Don't fail the request if email fails
    }

    res.json({ message: "Company verification rejected", company });
  } catch (error) {
    console.error("Error rejecting company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/companies/admin/:id/suspend
// @desc    Suspend a company
// @access  Private (Admin only)
router.put("/admin/:id/suspend", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { reason } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        status: "suspended",
        "verificationStatus.verificationNotes": reason,
      },
      { new: true }
    ).populate("recruiter", "email firstName lastName");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Send suspension email to recruiter
    try {
      if (company.recruiter && company.recruiter.email) {
        await emailService.sendCompanySuspendedEmail({
          recruiterEmail: company.recruiter.email,
          recruiterName:
            `${company.recruiter.firstName || ""} ${
              company.recruiter.lastName || ""
            }`.trim() || "Recruiter",
          companyName: company.name,
          suspensionDate: new Date(),
          suspensionReason: reason,
        });
        console.log("📧 Company suspension email sent successfully");
      }
    } catch (emailError) {
      console.error("⚠️ Failed to send suspension email:", emailError.message);
      // Don't fail the request if email fails
    }

    res.json({ message: "Company suspended successfully", company });
  } catch (error) {
    console.error("Error suspending company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/companies/admin/:id
// @desc    Delete a company
// @access  Private (Admin only)
router.delete("/admin/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
