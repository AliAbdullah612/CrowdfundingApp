const { AppError } = require('./error');

// Validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }
  return true;
};

// Validate password strength
const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!re.test(password)) {
    throw new AppError(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      400
    );
  }
  return true;
};

// Validate property input
const validateProperty = (property) => {
  const {
    name,
    description,
    location,
    totalValue,
    totalTokens,
    tokenPrice
  } = property;

  if (!name || name.length < 3) {
    throw new AppError('Property name must be at least 3 characters long', 400);
  }

  if (!description || description.length < 10) {
    throw new AppError('Property description must be at least 10 characters long', 400);
  }

  if (!location || !location.address || !location.city || !location.state || !location.zipCode) {
    throw new AppError('Please provide complete location details', 400);
  }

  if (!totalValue || totalValue <= 0) {
    throw new AppError('Total value must be greater than 0', 400);
  }

  if (!totalTokens || totalTokens <= 0) {
    throw new AppError('Total tokens must be greater than 0', 400);
  }

  if (!tokenPrice || tokenPrice <= 0) {
    throw new AppError('Token price must be greater than 0', 400);
  }

  // Validate token price calculation
  const calculatedTokenPrice = totalValue / totalTokens;
  if (Math.abs(calculatedTokenPrice - tokenPrice) > 0.01) {
    throw new AppError('Token price must equal total value divided by total tokens', 400);
  }

  return true;
};

// Validate crowdfunding input
const validateCrowdfunding = (crowdfunding) => {
  const { startDate, endDate, minInvestment, maxInvestment } = crowdfunding;

  if (!startDate || !endDate) {
    throw new AppError('Please provide both start and end dates', 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start < now) {
    throw new AppError('Start date must be in the future', 400);
  }

  if (end <= start) {
    throw new AppError('End date must be after start date', 400);
  }

  if (!minInvestment || minInvestment <= 0) {
    throw new AppError('Minimum investment must be greater than 0', 400);
  }

  if (!maxInvestment || maxInvestment <= minInvestment) {
    throw new AppError('Maximum investment must be greater than minimum investment', 400);
  }

  return true;
};

// Validate voting input
const validateVoting = (voting) => {
  const { title, description, endDate } = voting;

  if (!title || title.length < 3) {
    throw new AppError('Voting title must be at least 3 characters long', 400);
  }

  if (!description || description.length < 10) {
    throw new AppError('Voting description must be at least 10 characters long', 400);
  }

  if (!endDate) {
    throw new AppError('Please provide an end date', 400);
  }

  const end = new Date(endDate);
  const now = new Date();

  if (end <= now) {
    throw new AppError('End date must be in the future', 400);
  }

  return true;
};

// Validate investment input
const validateInvestment = (investment, property) => {
  const { amount } = investment;

  if (!amount || amount <= 0) {
    throw new AppError('Investment amount must be greater than 0', 400);
  }

  if (amount < property.crowdfunding.minInvestment) {
    throw new AppError(
      `Minimum investment is ${property.crowdfunding.minInvestment}`,
      400
    );
  }

  if (amount > property.crowdfunding.maxInvestment) {
    throw new AppError(
      `Maximum investment is ${property.crowdfunding.maxInvestment}`,
      400
    );
  }

  // Check if campaign is active
  const now = new Date();
  if (now < property.crowdfunding.startDate) {
    throw new AppError('Crowdfunding campaign has not started yet', 400);
  }

  if (now > property.crowdfunding.endDate) {
    throw new AppError('Crowdfunding campaign has ended', 400);
  }

  // Check if funding goal is already reached
  if (property.crowdfunding.totalRaised >= property.totalValue) {
    throw new AppError('Funding goal has already been reached', 400);
  }

  return true;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateProperty,
  validateCrowdfunding,
  validateVoting,
  validateInvestment
}; 