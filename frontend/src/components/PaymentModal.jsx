import React, { useState, useEffect } from 'react';
import { processPayment } from '../services/paymentService';

// Card type detection function
const getCardType = (cardNumber) => {
  const number = cardNumber.replace(/[\s-]/g, '');
  
  if (/^4/.test(number)) {
    return {
      type: 'visa',
      url: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/visa.svg'
    };
  }
  if (/^5[1-5]/.test(number)) {
    return {
      type: 'mastercard',
      url: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/mastercard.svg'
    };
  }
  if (/^3[47]/.test(number)) {
    return {
      type: 'amex',
      url: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/amex.svg'
    };
  }
  if (/^6(?:011|5)/.test(number)) {
    return {
      type: 'discover',
      url: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/discover.svg'
    };
  }
  if (/^3(?:0[0-5]|[68])/.test(number)) {
    return {
      type: 'diners',
      url: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/diners.svg'
    };
  }
  if (/^35/.test(number)) {
    return {
      type: 'jcb',
      url: 'https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/jcb.svg'
    };
  }
  
  return null;
};

// Format card number with spaces
const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

// Format expiry date
const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 3) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return value;
};

const PaymentModal = ({ isOpen, onClose, amount, onPaymentSuccess, onPaymentFailure }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState(null);
  const [showCvvTooltip, setShowCvvTooltip] = useState(false);

  useEffect(() => {
    const type = getCardType(cardNumber);
    setCardType(type);
  }, [cardNumber]);

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      alert('Please fill in all payment details');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentResult = await processPayment(amount, {
        cardNumber,
        expiry,
        cvv
      });

      if (paymentResult.success) {
        onPaymentSuccess(paymentResult);
      } else {
        onPaymentFailure(paymentResult.message);
      }
    } catch (error) {
      onPaymentFailure('An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        <div className="flex">
          {/* Left Side - Payment Form */}
          <div className="w-2/3 p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secure Payment</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Powered by SecurePay</p>
              </div>
              <div className="flex space-x-2">
                <img 
                  src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/visa.svg" 
                  alt="Visa" 
                  className="w-8 h-8"
                />
                <img 
                  src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/mastercard.svg" 
                  alt="Mastercard" 
                  className="w-8 h-8"
                />
                <img 
                  src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat-rounded/amex.svg" 
                  alt="Amex" 
                  className="w-8 h-8"
                />
              </div>
            </div>

            {/* Card Details Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                  {cardType && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <img 
                        src={cardType.url}
                        alt={cardType.type}
                        className="w-6 h-6"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formatExpiry(expiry)}
                    onChange={(e) => setExpiry(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CVV
                    <button
                      type="button"
                      className="ml-1 text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setShowCvvTooltip(true)}
                      onMouseLeave={() => setShowCvvTooltip(false)}
                    >
                      ?
                    </button>
                  </label>
                  {showCvvTooltip && (
                    <div className="absolute z-10 w-48 p-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg">
                      The 3-digit code on the back of your card
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={4}
                  />
                </div>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span>PCI Compliant</span>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                By clicking "Pay Now", you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="w-1/3 bg-gray-50 dark:bg-gray-700 p-8 border-l border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
                <span className="text-gray-900 dark:text-white">₹{amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Tax</span>
                <span className="text-gray-900 dark:text-white">₹{(amount * 0.18).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">₹{(parseFloat(amount) + parseFloat(amount) * 0.18).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>128-bit SSL Encryption</span>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
              <p>© 2024 SecurePay. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 