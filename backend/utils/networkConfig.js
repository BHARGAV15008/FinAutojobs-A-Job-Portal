import os from "os";

/**
 * Network Configuration Utility
 * Automatically detects host IP and generates proper URLs for network access
 * No hardcoded IPs - fully dynamic based on environment
 */

/**
 * Get the local network IP address
 * @returns {string} The local network IP address or '0.0.0.0' as fallback
 */
export function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();

  // Priority order: Look for active network interfaces
  for (const interfaceName of Object.keys(interfaces)) {
    const networkInterface = interfaces[interfaceName];

    for (const details of networkInterface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (!details.internal && details.family === "IPv4") {
        return details.address;
      }
    }
  }

  // Fallback to 0.0.0.0 (all interfaces)
  return "0.0.0.0";
}

/**
 * Get the appropriate host for the current environment
 * @param {string} defaultHost - Default host if no environment variable set
 * @returns {string} The host to use
 */
export function getHost(defaultHost = "0.0.0.0") {
  // In production or if HOST is explicitly set, use that
  if (process.env.HOST) {
    return process.env.HOST;
  }

  // For network access, bind to all interfaces
  return defaultHost;
}

/**
 * Get the backend URL based on environment and network configuration
 * @param {number} port - The port number
 * @returns {string} The backend URL
 */
export function getBackendURL(port) {
  // If BACKEND_URL is explicitly set, use it
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }

  // In production, use production URL
  if (
    process.env.NODE_ENV === "production" &&
    process.env.RENDER_EXTERNAL_URL
  ) {
    return process.env.RENDER_EXTERNAL_URL;
  }

  // For development, auto-detect IP
  const localIP = getLocalIPAddress();
  const protocol = process.env.USE_HTTPS === "true" ? "https" : "http";

  return `${protocol}://${localIP}:${port}`;
}

/**
 * Get the frontend URL based on environment
 * @returns {string} The frontend URL
 */
export function getFrontendURL() {
  // If explicitly set, use it
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  // In production, use production URL
  if (process.env.NODE_ENV === "production") {
    return (
      process.env.RENDER_EXTERNAL_URL ||
      "https://finautojobs-frontend.onrender.com"
    );
  }

  // For development, auto-detect IP
  const localIP = getLocalIPAddress();
  const frontendPort = process.env.FRONTEND_PORT || 3000;

  return `http://${localIP}:${frontendPort}`;
}

/**
 * Generate CORS origins automatically
 * @returns {string[]} Array of allowed CORS origins
 */
export function getCORSOrigins() {
  const origins = [];

  // Add explicitly configured origins
  if (process.env.CORS_ORIGIN) {
    const configuredOrigins = process.env.CORS_ORIGIN.split(",").map((o) =>
      o.trim()
    );
    origins.push(...configuredOrigins);
  }

  // Add frontend URL
  origins.push(getFrontendURL());

  // Add localhost variants for development
  if (process.env.NODE_ENV !== "production") {
    const frontendPort = process.env.FRONTEND_PORT || 3000;
    origins.push(
      `http://localhost:${frontendPort}`,
      `http://127.0.0.1:${frontendPort}`,
      `http://0.0.0.0:${frontendPort}`
    );
  }

  // Remove duplicates
  return [...new Set(origins)];
}

/**
 * Display network access information
 * @param {number} port - The port number
 * @param {string} serviceName - Name of the service (e.g., 'Backend', 'Frontend')
 */
export function displayNetworkInfo(port, serviceName = "Server") {
  const localIP = getLocalIPAddress();
  const protocol = process.env.USE_HTTPS === "true" ? "https" : "http";

  console.log("\n" + "=".repeat(60));
  console.log(`🌐 ${serviceName} Network Access Information`);
  console.log("=".repeat(60));
  console.log(`\n📍 Listening on:`);
  console.log(`   • All Interfaces: ${protocol}://0.0.0.0:${port}`);
  console.log(`   • Local Machine:  ${protocol}://localhost:${port}`);
  console.log(`   • Network Access: ${protocol}://${localIP}:${port}`);

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📱 Access from other devices on your network:`);
    console.log(`   ${protocol}://${localIP}:${port}`);
    console.log(`\n💡 Note: Ensure firewall allows port ${port}`);
  }

  console.log("=".repeat(60) + "\n");
}

/**
 * Validate network configuration
 * @returns {Object} Validation result with any warnings
 */
export function validateNetworkConfig() {
  const warnings = [];
  const info = {
    host: getHost(),
    localIP: getLocalIPAddress(),
    frontendURL: getFrontendURL(),
    corsOrigins: getCORSOrigins(),
    isProduction: process.env.NODE_ENV === "production",
  };

  // Check if binding to localhost only
  if (info.host === "localhost" || info.host === "127.0.0.1") {
    warnings.push(
      "⚠️  Server binding to localhost only - not accessible from network"
    );
    warnings.push("   Set HOST=0.0.0.0 for network access");
  }

  // Check CORS configuration
  if (info.corsOrigins.length === 0) {
    warnings.push("⚠️  No CORS origins configured");
  }

  // Check for localhost in production
  if (info.isProduction && info.frontendURL.includes("localhost")) {
    warnings.push("⚠️  Frontend URL contains localhost in production");
  }

  return { info, warnings };
}

export default {
  getLocalIPAddress,
  getHost,
  getBackendURL,
  getFrontendURL,
  getCORSOrigins,
  displayNetworkInfo,
  validateNetworkConfig,
};
