/**
 * IMPORTANT:
 * ---------
 * Do not manually edit this file if you'd like to host your server on Colyseus Cloud
 *
 * If you're self-hosting (without Colyseus Cloud), you can manually
 * instantiate a Colyseus Server as documented here:
 *
 * See: https://docs.colyseus.io/server/api/#constructor-options
 */

// Initialize tracing FIRST before any other imports
import { initializeTracing, shutdownTracing } from "./tracing";
const tracingSDK = initializeTracing();

import { listen } from "@colyseus/tools";

// Import Colyseus config
import app from "./app.config";

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  shutdownTracing(tracingSDK);
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  shutdownTracing(tracingSDK);
  process.exit(0);
});

// Create and listen on 2567 (or PORT environment variable.)
listen(app);
