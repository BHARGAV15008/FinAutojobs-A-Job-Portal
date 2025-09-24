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

export const downloadCandidateResume = async (candidateId) => {
  try {
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
    link.setAttribute("download", `candidate_resume_${candidateId}.pdf`);
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
