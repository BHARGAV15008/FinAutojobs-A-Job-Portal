import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Divider,
  Chip,
  Grid,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import {
  Close,
  LocationOn,
  Work,
  CurrencyRupee,
  Schedule,
  Business,
  Star,
  Share,
  BookmarkBorder,
  Bookmark,
  Description,
  School,
  Verified,
  People,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import colors from "../../styles/uiColors";

const DrawerHeader = styled(Box)(({ theme }) => ({
  padding: "24px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: "sticky",
  top: 0,
  backgroundColor: "#fff",
  zIndex: 10,
  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: "24px",
  overflowY: "auto",
  height: "calc(100% - 150px)", // Adjust based on header/footer height
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#e0e0e0",
    borderRadius: "3px",
  },
}));

const DrawerFooter = styled(Box)(({ theme }) => ({
  padding: "16px 24px",
  borderTop: `1px solid ${theme.palette.divider}`,
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "#fff",
  zIndex: 10,
  display: "flex",
  gap: "12px",
  boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
}));

const DetailRow = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
    <Box sx={{ color: "text.secondary", mr: 1.5, mt: 0.5 }}>{icon}</Box>
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 0.25 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} color="text.primary">
        {value}
      </Typography>
    </Box>
  </Box>
);

const JobDetailsDrawer = ({ open, onClose, job, onApply, onSave, isSaved }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!job) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "550px", md: "650px" },
          maxWidth: "100%",
        },
      }}
    >
      <DrawerHeader>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Avatar
              variant="rounded"
              src={job.logo}
              sx={{
                width: 64,
                height: 64,
                bgcolor: colors.primary,
                fontSize: "1.5rem",
                fontWeight: 700,
                border: "1px solid #e0e0e0",
              }}
            >
              {(job.company || "C").charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ lineHeight: 1.2, mb: 0.5 }}
              >
                {job.title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={500}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                {job.company}
                {job.verified && (
                  <Verified sx={{ fontSize: 16, color: colors.primary }} />
                )}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                {job.rating && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Star sx={{ fontSize: 16, color: "#fbbf24", mr: 0.5 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {job.rating}
                      </Typography>
                    </Box>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ height: 12, my: "auto" }}
                    />
                  </>
                )}
                {job.reviews && (
                  <Typography variant="body2" color="text.secondary">
                    {job.reviews} Reviews
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DrawerHeader>

      <DrawerContent>
        {/* Quick Info Grid */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <DetailRow
              icon={<Work fontSize="small" />}
              label="Experience"
              value={job.experience}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <DetailRow
              icon={<CurrencyRupee fontSize="small" />}
              label="Salary"
              value={job.salary}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <DetailRow
              icon={<LocationOn fontSize="small" />}
              label="Location"
              value={job.location}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <DetailRow
              icon={<Schedule fontSize="small" />}
              label="Job Type"
              value={job.jobType || job.type}
            />
          </Grid>
          { (job.vacancies || job.openings || job.vacancy) && (
            <Grid item xs={6} sm={3}>
              <DetailRow
                icon={<People fontSize="small" />}
                label="Openings"
                value={job.vacancies || job.openings || job.vacancy}
              />
            </Grid>
          )}
          <Grid item xs={6} sm={3}>
            <DetailRow
              icon={<Business fontSize="small" />}
              label="Department"
              value={job.department || job.jobCategory || job.category}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Job Description */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: "1.1rem" }}
          >
            Job Description
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            paragraph
            sx={{ lineHeight: 1.6, whiteSpace: "pre-line" }}
          >
            {job.jobDescription ||
              job.description ||
              "No detailed description available."}
          </Typography>
        </Box>

        {/* Key Skills */}
        { job.skills && job.skills.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ fontSize: "1.1rem" }}
            >
              Key Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {job.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  variant="outlined"
                  sx={{
                    borderRadius: "6px",
                    borderColor: "#e0e0e0",
                    bgcolor: "#fafafa",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ fontSize: "1.1rem" }}
            >
              Key Responsibilities
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
              {job.responsibilities.map((item, index) => (
                <Box
                  component="li"
                  key={index}
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Qualifications */}
        {((job.qualifications && job.qualifications.length > 0) || (job.requirements && job.requirements.length > 0)) && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ fontSize: "1.1rem" }}
            >
              Qualifications & Requirements
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
              {(job.qualifications || job.requirements || []).map(
                (item, index) => (
                  <Box
                    component="li"
                    key={index}
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    <Typography variant="body2">{item}</Typography>
                  </Box>
                )
              )}
            </Box>
          </Box>
        )}

        {/* About Company */}
        <Box sx={{ bgcolor: "#f8fafc", p: 2.5, borderRadius: "6px" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            About {job.company}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                  mb: 0.5,
                }}
              >
                <Business fontSize="small" sx={{ fontSize: 16 }} />
                <Typography variant="caption">Industry</Typography>
              </Box>
              <Typography variant="body2" fontWeight={500}>
                {job.industry}
              </Typography>
            </Grid>
            {job.companySize && (
              <Grid item xs={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "text.secondary",
                    mb: 0.5,
                  }}
                >
                  <School fontSize="small" sx={{ fontSize: 16 }} />
                  <Typography variant="caption">Company Size</Typography>
                </Box>
                <Typography variant="body2" fontWeight={500}>
                  {job.companySize}
                </Typography>
              </Grid>
            )}
          </Grid>
          {job.companyDescription && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {job.companyDescription}
            </Typography>
          )}
        </Box>
      </DrawerContent>

      <DrawerFooter>
        <Button
          variant="outlined"
          startIcon={isSaved ? <Bookmark /> : <BookmarkBorder />}
          onClick={onSave}
          fullWidth={isMobile}
          sx={{
            flex: 1,
            borderColor: "#e0e0e0",
            color: "text.primary",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {isSaved ? "Saved" : "Save Job"}
        </Button>
        <Button
          variant="contained"
          onClick={() => onApply && onApply(job)}
          fullWidth={isMobile}
          sx={{
            flex: 2,
            bgcolor: colors.primary,
            "&:hover": { bgcolor: colors.primaryDark },
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          Apply Now
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};

export default JobDetailsDrawer;
