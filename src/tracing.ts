import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";
import { trace, SpanStatusCode, SpanKind } from "@opentelemetry/api";

// Service name for tracing
const serviceName = "snailmail-game-server";

// Initialize tracing based on environment variables
export function initializeTracing(): NodeSDK | null {
  // Check if tracing is enabled
  const tracingEnabled = process.env.TRACING_ENABLED?.toLowerCase() === "true";
  if (!tracingEnabled) {
    console.log("Tracing disabled. Set TRACING_ENABLED=true to enable.");
    return null;
  }

  console.log("Initializing OpenTelemetry tracing...");

  // Determine which exporter to use
  let traceExporter;
  const exporterType = process.env.TRACE_EXPORTER || "console";

  switch (exporterType.toLowerCase()) {
    case "jaeger":
      traceExporter = new JaegerExporter({
        endpoint:
          process.env.JAEGER_ENDPOINT || "http://localhost:14268/api/traces",
      });
      console.log(
        "Using Jaeger exporter:",
        process.env.JAEGER_ENDPOINT || "http://localhost:14268/api/traces",
      );
      break;

    case "otlp":
      traceExporter = new OTLPTraceExporter({
        url: process.env.OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
        headers: process.env.OTLP_HEADERS
          ? JSON.parse(process.env.OTLP_HEADERS)
          : {},
      });
      console.log(
        "Using OTLP exporter:",
        process.env.OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
      );
      break;

    default:
      console.log("Using console exporter (logs traces to console)");
      // Console exporter is included by default in auto-instrumentations
      traceExporter = undefined;
      break;
  }

  // Configure Node SDK
  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable some instrumentations if needed
        "@opentelemetry/instrumentation-fs": {
          enabled: false, // Disable filesystem instrumentation to reduce noise
        },
      }),
    ],
  });

  try {
    sdk.start();
    console.log("OpenTelemetry tracing initialized successfully");
    return sdk;
  } catch (error) {
    console.error("Error initializing OpenTelemetry:", error);
    return null;
  }
}

// Create a tracer instance for manual instrumentation
export function getTracer() {
  return trace.getTracer(serviceName);
}

// Helper function to create spans with error handling
export function createSpan(
  name: string,
  fn: (span: any) => Promise<any> | any,
  options: {
    kind?: SpanKind;
    attributes?: Record<string, string | number | boolean>;
  } = {},
) {
  const tracer = getTracer();

  return tracer.startActiveSpan(name, { kind: options.kind }, async (span) => {
    try {
      // Add custom attributes
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          span.setAttributes({ [key]: value });
        });
      }

      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Graceful shutdown
export function shutdownTracing(sdk: NodeSDK | null) {
  if (sdk) {
    sdk
      .shutdown()
      .then(() => console.log("Tracing terminated"))
      .catch((error) => console.log("Error terminating tracing", error));
  }
}
