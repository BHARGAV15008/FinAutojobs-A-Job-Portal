import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getCandidateDetails = async (candidateId) => {
  try {
    const response = await axios.get(`${API_URL}/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching candidate details"
    );
  }
};

export const sendEmailToCandidate = async (candidateId, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/candidates/${candidateId}/email`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error sending email");
  }
};

export const sendMessageToCandidate = async (candidateId, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/candidates/${candidateId}/message`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error sending message");
  }
};

export const scheduleInterview = async (candidateId, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/candidates/${candidateId}/interview`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error scheduling interview"
    );
  }
};

export const updateInterview = async (interviewId, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/candidates/interview/${interviewId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error updating interview"
    );
  }
};

export const deleteInterview = async (interviewId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/candidates/interview/${interviewId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error deleting interview"
    );
  }
};

export const toggleCandidateShortlist = async (candidateId) => {
  try {
    const response = await axios.put(
      `${API_URL}/candidates/${candidateId}/shortlist`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error updating shortlist status"
    );
  }
};

export const downloadCandidateResume = async (candidateId, candidateName, candidateUsername) => {
  try {
    // First try to get candidate profile to get username and resume URL
    let resumeUrl = null;
    let filename = `candidate_resume_${candidateId}.pdf`;
    
    try {
      const profileResponse = await axios.get(`${API_URL}/users/${candidateId}/profile`);
      const profile = profileResponse.data.data || profileResponse.data;
      
      // Get username and construct expected filename
      const username = profile.username || candidateUsername;
      if (username) {
        filename = `resume_${username}.pdf`;
        resumeUrl = `/uploads/documents/resume_${username}.pdf`;
      }
      
      // Check for existing resume URL in profile
      const existingResumeUrl = profile.resume_url || profile.documents?.resumeUrl;
      if (existingResumeUrl) {
        resumeUrl = existingResumeUrl;
        // Extract filename from URL for download
        const urlParts = existingResumeUrl.split('/');
        const urlFilename = urlParts[urlParts.length - 1];
        if (urlFilename && urlFilename.includes('.')) {
          filename = urlFilename;
        }
      }
    } catch (profileError) {
      console.log('Could not fetch profile, using fallback method');
    }

    // Try direct file download first if we have a resume URL
    if (resumeUrl) {
      try {
        const directUrl = resumeUrl.startsWith('http') ? resumeUrl : `${API_URL.replace('/api', '')}${resumeUrl}`;
        const response = await axios.get(directUrl, { responseType: "blob" });
        
        // Create download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true };
      } catch (directError) {
        console.log('Direct download failed, trying API endpoint');
      }
    }

    // Fallback to API endpoint
    const response = await axios.get(
      `${API_URL}/candidates/${candidateId}/resume`,
      {
        responseType: "blob",
      }
    );

    // Create a temporary URL for the blob and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error downloading resume"
    );
  }
};
