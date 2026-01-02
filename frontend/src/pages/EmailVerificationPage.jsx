import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import api from "../services/api";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Shield,
  ArrowRight,
  Lock,
} from "lucide-react";

const EmailVerificationPage = () => {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP entry, 3: Success
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Extract token from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get("token");

    if (verificationToken) {
      setToken(verificationToken);
      validateToken(verificationToken);
    } else {
      setError("Invalid verification link. Please contact support.");
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Validate verification token
  const validateToken = async (verificationToken) => {
    try {
      setLoading(true);
      const response = await api.get(`/auth/verify-token/${verificationToken}`);

      if (response.data.success) {
        setTokenValid(true);
        setUserInfo(response.data.data);
        setEmail(response.data.data.email);
        setError("");
      } else {
        setError(
          response.data.message || "Invalid or expired verification link"
        );
        setTokenValid(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to validate verification link"
      );
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (email.toLowerCase() !== userInfo?.email?.toLowerCase()) {
      setError("Email does not match the verification link");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/send-verification-otp", {
        email: email,
        token: token,
      });

      if (response.data.success) {
        setOtpSent(true);
        setStep(2);
        setSuccess("OTP sent to your email! Please check your inbox.");
        setCountdown(60); // 60 seconds cooldown
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      setError("Please enter a valid OTP code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/verify-email-otp", {
        email: email,
        otp: otp,
        token: token,
      });

      if (response.data.success) {
        setStep(3);
        setSuccess("Email verified successfully! Your account is now active.");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
      } else {
        setError(response.data.message || "Invalid OTP code");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Please check your OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setOtp("");
    setError("");
    setSuccess("");
    await handleSendOTP({ preventDefault: () => {} });
  };

  if (loading && !tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating verification link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Link
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setLocation("/login")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h1>
          <p className="text-gray-600">
            {step === 1 && "Confirm your email to verify your account"}
            {step === 2 && "Enter the OTP code sent to your email"}
            {step === 3 && "Verification completed successfully!"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`flex items-center ${
              step >= 1 ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-gray-300"
              }`}
            >
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
            </div>
            <div
              className={`w-12 h-1 ${
                step >= 2 ? "bg-indigo-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
          <div
            className={`flex items-center ${
              step >= 2 ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-gray-300"
              }`}
            >
              {step > 2 ? <CheckCircle className="w-5 h-5" /> : "2"}
            </div>
            <div
              className={`w-12 h-1 ${
                step >= 3 ? "bg-indigo-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
          <div className={`${step >= 3 ? "text-indigo-600" : "text-gray-400"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 3
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-gray-300"
              }`}
            >
              {step >= 3 ? <CheckCircle className="w-5 h-5" /> : "3"}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Step 1: Email Confirmation */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                  readOnly={userInfo?.email}
                />
              </div>
              {userInfo && (
                <p className="text-sm text-gray-500 mt-2">
                  📧 Verifying account for:{" "}
                  <strong>
                    {userInfo.firstName} {userInfo.lastName}
                  </strong>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP Code
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Entry */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength="9"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                We sent a code to <strong>{email}</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Activate Account
                  <CheckCircle className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || loading}
              className="w-full text-indigo-600 hover:text-indigo-700 font-medium py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Complete!
            </h3>
            <p className="text-gray-600 mb-6">
              Your email has been verified successfully. Your account is now
              active.
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                ✅ Account activated
                <br />
                📧 Email verified
                <br />
                🎉 Ready to login
              </p>
            </div>
            <button
              onClick={() => setLocation("/login")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
            >
              Go to Login
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="/contact"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
