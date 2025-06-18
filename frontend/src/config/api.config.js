const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ADMIN_LOGIN: '/auth/admin/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_DOB: '/auth/verify-dob',
    RESET_PASSWORD: '/auth/reset-password'
  },
  // Properties
  PROPERTIES: {
    BASE: '/properties',
    BY_ID: (id) => `/properties/${id}`,
    BY_STATUS: (status) => `/properties/status/${status}`,
    ADMIN: '/properties/admin'
  },
  // Crowdfunding
  CROWDFUNDING: {
    BASE: '/crowdfunding',
    BY_ID: (id) => `/crowdfunding/${id}`,
    BY_PROPERTY: (propertyId) => `/crowdfunding/property/${propertyId}`,
    ADMIN: '/crowdfunding/admin',
    INVEST: (id) => `/crowdfunding/${id}/invest`,
    END: (id) => `/crowdfunding/${id}/end`
  },
  // Voting
  VOTING: {
    BASE: '/voting',
    BY_ID: (id) => `/voting/${id}`,
    VOTE: (id) => `/voting/${id}/vote`,
    END: (id) => `/voting/${id}/end`,
    ADMIN: '/voting/admin',
    HISTORY: '/voting/user/history',
    RESULTS: '/voting/admin/results'
  },
  // Profile
  PROFILE: {
    USER: '/profile/user',
    ADMIN: '/profile/admin',
    STATISTICS: '/profile/admin/statistics',
    INVESTMENTS: '/profile/investments',
    TRANSACTIONS: '/profile/transactions'
  }
};

export default API_CONFIG; 