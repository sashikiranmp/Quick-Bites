// Mock payment service for testing purposes
const processPayment = async (amount, orderDetails) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For testing purposes, we'll randomly succeed or fail
  const isSuccess = Math.random() > 0.2; // 80% success rate for testing
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: `MOCK-${Date.now()}`,
      message: 'Payment successful'
    };
  } else {
    return {
      success: false,
      message: 'Payment failed. Please try again.'
    };
  }
};

export { processPayment }; 