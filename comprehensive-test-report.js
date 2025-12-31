#!/usr/bin/env node

/**
 * Comprehensive Test Report for FinAutoJobs
 * Tests all APIs and forms systematically
 */

import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api";
const FRONTEND_URL = "http://localhost:3000";

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  results: [],
};

function recordTest(name, passed, message = "", details = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  }

  testResults.results.push({
    name,
    passed,
    message,
    details,
    timestamp: new Date().toISOString(),
  });
}

async function testHealthChecks() {
  console.log("\n🏥 HEALTH CHECK TESTS");
  console.log("=".repeat(50));

  try {
    // Backend health
    const backendResponse = await fetch(BASE_URL + "/health");
    const backendData = await backendResponse.json();
    recordTest(
      "Backend Health Check",
      backendResponse.ok,
      `Status: ${backendResponse.status}`,
      backendData
    );

    // Frontend health
    const frontendResponse = await fetch(FRONTEND_URL);
    recordTest(
      "Frontend Health Check",
      frontendResponse.ok,
      `Status: ${frontendResponse.status}`
    );
  } catch (error) {
    recordTest("Health Checks", false, error.message);
  }
}

async function testAuthentication() {
  console.log("\n🔐 AUTHENTICATION TESTS");
  console.log("=".repeat(50));

  try {
    const testEmail = "comprehensive-test" + Date.now() + "@example.com";

    // Test registration
    const registerResponse = await fetch(BASE_URL + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "TestPassword123!",
        firstName: "Test",
        lastName: "User",
        role: "applicant",
        phone: "9876543210",
      }),
    });

    const registerData = await registerResponse.json();
    recordTest(
      "User Registration",
      registerResponse.ok,
      registerResponse.ok ? "Registration successful" : registerData.message
    );

    if (registerResponse.ok) {
      // Test login
      const loginResponse = await fetch(BASE_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: testEmail,
          password: "TestPassword123!",
          role: "applicant",
        }),
      });

      const loginData = await loginResponse.json();
      recordTest(
        "User Login",
        loginResponse.ok,
        loginResponse.ok ? "Login successful" : loginData.message
      );

      if (loginResponse.ok) {
        const token = loginData.data.token;

        // Test profile fetch
        const profileResponse = await fetch(BASE_URL + "/auth/profile", {
          headers: { Authorization: "Bearer " + token },
        });

        recordTest(
          "Profile Fetch",
          profileResponse.ok,
          profileResponse.ok ? "Profile retrieved" : "Profile fetch failed"
        );
      }
    }
  } catch (error) {
    recordTest("Authentication Tests", false, error.message);
  }
}

async function testJobAPIs() {
  console.log("\n💼 JOB API TESTS");
  console.log("=".repeat(50));

  const jobEndpoints = [
    { path: "/jobs", name: "Get All Jobs" },
    { path: "/jobs/search?q=developer", name: "Search Jobs" },
    { path: "/jobs/categories", name: "Get Job Categories" },
    { path: "/jobs/locations", name: "Get Job Locations" },
    { path: "/jobs/filters/options", name: "Get Filter Options" },
    { path: "/jobs/stats/overview", name: "Get Job Statistics" },
  ];

  for (const endpoint of jobEndpoints) {
    try {
      const response = await fetch(BASE_URL + endpoint.path);
      const data = await response.json();

      recordTest(
        endpoint.name,
        response.ok,
        response.ok ? `Status: ${response.status}` : data.message,
        data
      );
    } catch (error) {
      recordTest(endpoint.name, false, error.message);
    }
  }
}

async function testOAuthAPIs() {
  console.log("\n🔗 OAUTH API TESTS");
  console.log("=".repeat(50));

  const oauthEndpoints = [
    { path: "/oauth/status", name: "OAuth Status" },
    { path: "/oauth/config", name: "OAuth Config" },
    { path: "/oauth/debug", name: "OAuth Debug" },
  ];

  for (const endpoint of oauthEndpoints) {
    try {
      const response = await fetch(BASE_URL + endpoint.path);
      const data = await response.json();

      recordTest(
        endpoint.name,
        response.ok,
        response.ok ? `Status: ${response.status}` : data.message,
        data
      );
    } catch (error) {
      recordTest(endpoint.name, false, error.message);
    }
  }
}

async function testCompanyAPIs() {
  console.log("\n🏢 COMPANY API TESTS");
  console.log("=".repeat(50));

  try {
    const response = await fetch(BASE_URL + "/companies");
    const data = await response.json();

    recordTest(
      "Get All Companies",
      response.ok,
      response.ok ? `Found ${data.data?.length || 0} companies` : data.message
    );
  } catch (error) {
    recordTest("Company APIs", false, error.message);
  }
}

async function testApplicationAPIs() {
  console.log("\n📋 APPLICATION API TESTS");
  console.log("=".repeat(50));

  try {
    // This requires authentication, so we'll test without token first
    const response = await fetch(BASE_URL + "/applications");

    // Should return 401 without token
    recordTest(
      "Applications Endpoint Security",
      response.status === 401,
      response.status === 401
        ? "Properly secured (401 without token)"
        : "Security issue"
    );
  } catch (error) {
    recordTest("Application APIs", false, error.message);
  }
}

async function generateReport() {
  console.log("\n📊 COMPREHENSIVE TEST REPORT");
  console.log("=".repeat(60));

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(
    1
  );

  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${successRate}%`);

  if (testResults.failed > 0) {
    console.log("\n❌ FAILED TESTS:");
    testResults.results
      .filter((result) => !result.passed)
      .forEach((result) => {
        console.log(`   • ${result.name}: ${result.message}`);
      });
  }

  console.log("\n✅ PASSED TESTS:");
  testResults.results
    .filter((result) => result.passed)
    .forEach((result) => {
      console.log(`   • ${result.name}: ${result.message}`);
    });

  // Save detailed report
  const fs = await import("fs");
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: successRate + "%",
    },
    results: testResults.results,
  };

  fs.writeFileSync(
    "comprehensive-test-results.json",
    JSON.stringify(reportData, null, 2)
  );
  console.log("\n📄 Detailed report saved to: comprehensive-test-results.json");

  return testResults.failed === 0;
}

async function runComprehensiveTests() {
  console.log("🚀 FINAUTOJOBS COMPREHENSIVE TESTING SUITE");
  console.log("Testing Backend APIs and Frontend Forms");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    await testHealthChecks();
    await testAuthentication();
    await testJobAPIs();
    await testOAuthAPIs();
    await testCompanyAPIs();
    await testApplicationAPIs();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n⏱️ Total test duration: ${duration}s`);

    const success = await generateReport();

    if (success) {
      console.log("\n🎉 ALL TESTS PASSED! FinAutoJobs is working correctly.");
    } else {
      console.log("\n⚠️ Some tests failed. Please review the issues above.");
    }

    return success;
  } catch (error) {
    console.error("\n💥 Test suite failed:", error.message);
    return false;
  }
}

// Run the comprehensive tests
runComprehensiveTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  });
