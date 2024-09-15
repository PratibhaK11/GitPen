import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002';

// Fetch repository by ID
export const fetchRepositoryById = async (repoId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repo/${repoId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching repository by ID:", error);
    throw error;
  }
};

// Fetch files for the repository
export const fetchRepositoryFiles = async (repoId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repo/files/${repoId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching repository files:", error);
    throw error;
  }
};

// Fetch commits for the repository
export const fetchCommits = async (repoId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repo/commits/${repoId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw error;
  }
};

// Update a repository by ID
export const updateRepositoryById = async (repoId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/repo/update/${repoId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating repository:", error);
    throw error;
  }
};

// Delete a repository by ID
export const deleteRepositoryById = async (repoId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/repo/delete/${repoId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting repository:", error);
    throw error;
  }
};

// Create a new issue
export const createIssue = async (issueData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/issue/create`, issueData);
    return response.data;
  } catch (error) {
    console.error("Error creating issue:", error);
    throw error;
  }
};

// Fetch issues for the repository
export const fetchIssues = async (repoId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/issue/all/${repoId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

// Update an issue
export const updateIssue = async (issueId, issueData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/issue/update/${issueId}`, issueData);
    return response.data;
  } catch (error) {
    console.error("Error updating issue:", error);
    throw error;
  }
};

// Delete an issue
export const deleteIssue = async (issueId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/issue/delete/${issueId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting issue:", error);
    throw error;
  }
};
