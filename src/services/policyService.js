import axiosInstance from './axiosInstance';
import { parseApiError } from '../utils/errorHandler';

const API_URL = process.env.REACT_APP_API_URL;
const POLICY_API_URL = `${API_URL}/api/policies`;

/**
 * Create a new policy document version (admin only)
 */
export const createDocument = async (docType, content, changelog) => {
  try {
    const response = await axiosInstance.post(`${POLICY_API_URL}/documents/versions/create`, {
      docType,
      content,
      changelog,
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Update an existing policy document (admin only)
 */
export const updateDocument = async (docType, content, changelog) => {
  try {
    const response = await axiosInstance.post(
      `${POLICY_API_URL}/documents/versions/create`,
      {
        docType,
        content,
        changelog,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Publish a new policy version and notify users (admin only)
 */
export const publishDocument = async (docType) => {
  try {
    const response = await axiosInstance.post(
      `${POLICY_API_URL}/notifications/send`,
      { docType }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get the current active policy document (public)
 */
export const getActiveDocument = async (docType) => {
  try {
    const response = await axiosInstance.get(`${POLICY_API_URL}/documents/${docType}/current`);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get a specific version of a policy document (public)
 */
export const getDocumentVersion = async (docType, version) => {
  try {
    const response = await axiosInstance.get(
      `${POLICY_API_URL}/documents/${docType}/current`,
      { params: { version } }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get full version history for a policy document (admin only)
 */
export const getDocumentHistory = async (docType) => {
  try {
    const response = await axiosInstance.get(
      `${POLICY_API_URL}/documents/${docType}/history`
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Log user acknowledgment of a policy (authenticated users)
 * Called during signup, after policy update, or re-acknowledgment
 */
export const logAcknowledgment = async (
  docType,
  version,
  acknowledgedFrom = 'signup'
) => {
  try {
    const response = await axiosInstance.post(`${POLICY_API_URL}/acknowledgments`, {
      docType,
      version,
      acknowledgedFrom,
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Queue policy update notification emails to all users (admin only)
 */
export const notifyPolicyUpdate = async (docType) => {
  try {
    const response = await axiosInstance.post(
      `${POLICY_API_URL}/notifications/send`,
      { docType }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get compliance report with acknowledgment analytics (admin only)
 */
export const getComplianceReport = async (filters = {}) => {
  try {
    const response = await axiosInstance.get(`${POLICY_API_URL}/reports/compliance`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get detailed audit log of policy changes (admin only)
 */
export const getAuditLog = async (filters = {}) => {
  try {
    const response = await axiosInstance.get(`${POLICY_API_URL}/acknowledgments/audit-trail`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Initialize or update policy review schedule (admin only)
 */
export const initializeSchedule = async (docType, reviewFrequency) => {
  try {
    const response = await axiosInstance.post(
      `${POLICY_API_URL}/schedule/initialize`,
      {
        docType,
        reviewFrequency,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get policy acknowledgment statistics (admin only)
 */
export const getAcknowledgmentStats = async (docType) => {
  try {
    const response = await axiosInstance.get(
      `${POLICY_API_URL}/acknowledgments/statistics`,
      { params: { docType } }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get non-compliant users (admin only)
 */
export const getNonCompliantUsers = async (docType) => {
  try {
    const response = await axiosInstance.get(
      `${POLICY_API_URL}/reports/non-compliant-users`,
      { params: { docType } }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Get upcoming policy reviews (admin only)
 */
export const getUpcomingReviews = async () => {
  try {
    const response = await axiosInstance.get(`${POLICY_API_URL}/reports/upcoming-reviews`);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};
