import React, { useState } from 'react';
import { applicationsAPI } from '../../services/api';
import { getAuthToken, setAuthToken } from '../../utils/auth';

const ApiConnectionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Check if we have a token
      const token = getAuthToken();
      results.hasToken = !!token;
      results.token = token ? `${token.substring(0, 20)}...` : 'No token found';

      // Test 2: Try to fetch applications (this will test the API connection)
      try {
        const response = await applicationsAPI.getApplications({ limit: 1 });
        results.apiConnection = 'SUCCESS';
        results.apiResponse = response.data;
      } catch (error) {
        results.apiConnection = 'FAILED';
        results.apiError = error.response?.data?.message || error.message;
        results.apiStatus = error.response?.status;
      }

      // Test 3: Try to update an application status (with a fake ID to test endpoint)
      try {
        await applicationsAPI.updateApplicationStatus(999, 'pending');
        results.statusUpdate = 'SUCCESS (unexpected)';
      } catch (error) {
        results.statusUpdate = 'EXPECTED_ERROR';
        results.statusError = error.response?.data?.message || error.message;
        results.statusCode = error.response?.status;
      }

    } catch (error) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  const createTestToken = () => {
    // Create a test JWT token for development
    const testPayload = {
      userId: 1,
      email: 'test@example.com',
      role: 'recruiter',
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
    };
    
    // This is a fake token for testing - in production, you'd get this from login
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                     btoa(JSON.stringify(testPayload)) + 
                     '.fake_signature_for_testing';
    
    setAuthToken(fakeToken);
    alert('Test token created! You can now test API calls.');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        🔧 API Connection Test
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testApiConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔄 Testing...' : '🧪 Test API Connection'}
          </button>
          
          <button
            onClick={createTestToken}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🔑 Create Test Token
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Test Results:
            </h3>
            
            <div className="space-y-2 text-sm">
              {Object.entries(testResults).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {key}:
                  </span>
                  <span className={`${
                    key.includes('Error') || key.includes('FAILED') 
                      ? 'text-red-600 dark:text-red-400' 
                      : key.includes('SUCCESS') 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Troubleshooting Tips:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Make sure the backend server is running on http://localhost:5000</li>
            <li>• Check if you have a valid authentication token</li>
            <li>• Verify CORS is properly configured on the backend</li>
            <li>• Check browser console for detailed error messages</li>
            <li>• Try creating a test token first, then test the API</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiConnectionTest;
