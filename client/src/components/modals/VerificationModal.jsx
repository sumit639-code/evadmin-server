import React, { useState } from 'react';
import { FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { verificationChecks, runVerificationChecks, verifyHost } from '../../utils/verificationUtils';

const VerificationModal = ({ isOpen, onClose, hostData, onVerificationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  const steps = [
    { id: verificationChecks.DOCUMENT_CHECK, label: 'Document Verification' },
    { id: verificationChecks.BACKGROUND_CHECK, label: 'Background Check' },
    { id: verificationChecks.IDENTITY_CHECK, label: 'Identity Verification' },
    { id: verificationChecks.ADDRESS_CHECK, label: 'Address Verification' }
  ];

  const handleVerification = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Run verification checks
      const results = await runVerificationChecks(verificationChecks);
      setVerificationResults(results);
      
      // Check if all verifications passed
      const allPassed = Object.values(results).every(result => result.passed);
      
      if (allPassed) {
        // Complete host verification
        const response = await verifyHost(hostData.id, results);
        onVerificationComplete(response);
        onClose();
      } else {
        setError('Some verification checks failed. Please review the results.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Host Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-1">
              <h3 className="font-medium">{hostData.name}</h3>
              <p className="text-sm text-gray-500">{hostData.email}</p>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-lg border
                  ${index === currentStep ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white border">
                    {verificationResults?.[step.id]?.passed ? (
                      <FiCheck className="text-green-500" />
                    ) : index === currentStep && loading ? (
                      <FiLoader className="text-blue-500 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {step.label}
                </span>
                {verificationResults?.[step.id] && (
                  <span className={`text-sm ${verificationResults[step.id].passed ? 'text-green-500' : 'text-red-500'}`}>
                    {verificationResults[step.id].passed ? 'Passed' : 'Failed'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleVerification}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2
              ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading && <FiLoader className="animate-spin" />}
            {loading ? 'Verifying...' : 'Start Verification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
