import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDashboard } from "../../contexts/RealDashboardContext";
import { useAuth } from "../../contexts/AuthContext.jsx";

const LoginDemo = () => {
  const { demoAccounts } = useDashboard();
  const { login, loading, error: authError } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loginStatus, setLoginStatus] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  useEffect(() => {
    // Check for previous lockout
    const storedLockout = localStorage.getItem("loginLockout");
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (lockoutTime > Date.now()) {
        setLockoutUntil(lockoutTime);
      } else {
        localStorage.removeItem("loginLockout");
      }
    }
  }, []);

  const handleDemoLogin = async (account) => {
    // Check if locked out
    if (lockoutUntil && lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setLoginStatus("locked");
      return;
    }

    setSelectedAccount(account);
    setLoginStatus("logging_in");

    try {
      const result = await login({
        email: account.email,
        password: account.password,
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: `${window.screen.width}x${window.screen.height}`,
        },
      });

      if (result.success) {
        setLoginStatus("success");
        // Reset attempts on successful login
        setAttempts(0);
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("loginLockout");
      } else {
        handleLoginFailure();
      }
    } catch (error) {
      handleLoginFailure();
    }
  };

  const handleLoginFailure = () => {
    setLoginStatus("error");

    // Increment attempts
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Store attempts in localStorage
    localStorage.setItem("loginAttempts", newAttempts.toString());

    // Check if should lockout (5 attempts)
    if (newAttempts >= 5) {
      const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutes
      setLockoutUntil(lockoutTime);
      localStorage.setItem("loginLockout", lockoutTime.toString());
    }

    setTimeout(() => setLoginStatus(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            FinAutoJobs
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Login with a demo account to see real data
          </p>
        </div>

        {loginStatus === "logging_in" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-blue-700 dark:text-blue-300">Logging in...</p>
          </div>
        )}

        {loginStatus === "success" && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <p className="text-green-700 dark:text-green-300">
              ✅ Login successful!
            </p>
          </div>
        )}

        {loginStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
            <p className="text-red-700 dark:text-red-300">
              ❌ Login failed. Please try again.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Demo Accounts
          </h3>

          {demoAccounts.map((account, index) => (
            <motion.button
              key={account.email}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDemoLogin(account)}
              disabled={loading}
              className="w-full p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {account.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {account.role} Account
                  </p>
                </div>
                <div className="text-blue-600 dark:text-blue-400">→</div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Or continue as guest to see mock data
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => (window.location.href = "/applicant-dashboard")}
            className="w-full mt-3 p-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
          >
            Continue as Guest
          </motion.button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            All demo accounts use password: Password123!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginDemo;
