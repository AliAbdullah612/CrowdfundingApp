import api from './api';

const API_URL = '/payments';

export const createPaymentIntent = (data) => api.post(`${API_URL}/create-payment-intent`, data);

export const buyProperty = async (data) => {
  try {
    const response = await api.post(`${API_URL}/buy-property`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const confirmPayment = async (paymentIntentId, propertyId) => {
  try {
    const response = await api.post('/payments/confirm-payment', {
      paymentIntentId,
      propertyId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTransactions = () => api.get(`${API_URL}/transactions`);
export const getTransaction = (id) => api.get(`${API_URL}/transactions/${id}`); 