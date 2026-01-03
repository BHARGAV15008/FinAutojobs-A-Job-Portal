/**
 * Quick test script to check if companies API is working
 */

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function testCompaniesAPI() {
  console.log("🔍 Testing Companies API...\n");
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  try {
    // Test 1: Fetch all companies
    console.log("📡 Fetching companies...");
    const response = await fetch(`${API_BASE_URL}/companies?limit=100`);

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log("\n✅ Response received:");
      console.log(JSON.stringify(data, null, 2));

      // Check data structure
      let companiesArray = [];
      if (data.success && data.data && data.data.companies) {
        companiesArray = data.data.companies;
        console.log(
          `\n📊 Found ${companiesArray.length} companies (data.data.companies structure)`
        );
      } else if (data.companies) {
        companiesArray = data.companies;
        console.log(
          `\n📊 Found ${companiesArray.length} companies (data.companies structure)`
        );
      } else if (Array.isArray(data)) {
        companiesArray = data;
        console.log(
          `\n📊 Found ${companiesArray.length} companies (array structure)`
        );
      } else {
        console.log("\n⚠️ Unexpected data structure:", Object.keys(data));
      }

      // Show sample company
      if (companiesArray.length > 0) {
        console.log("\n📋 Sample company:");
        console.log(JSON.stringify(companiesArray[0], null, 2));

        // Analyze fields
        console.log("\n🔍 Available fields:");
        console.log(Object.keys(companiesArray[0]).join(", "));
      } else {
        console.log("\n⚠️ No companies found in database!");
        console.log(
          "💡 You may need to add companies through the recruiter dashboard or seed the database."
        );
      }
    } else {
      console.error(`\n❌ Failed to fetch companies: ${response.status}`);
      const errorText = await response.text();
      console.error("Error:", errorText);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the test
testCompaniesAPI();
