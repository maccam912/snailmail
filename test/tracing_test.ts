import assert from "assert";
import { initializeTracing, createSpan, getTracer } from "../src/tracing";

describe("tracing functionality", () => {
  it("should initialize tracing when enabled", () => {
    // Set environment variable
    process.env.TRACING_ENABLED = "true";
    process.env.TRACE_EXPORTER = "console";

    const sdk = initializeTracing();
    assert.ok(sdk !== null, "Tracing SDK should be initialized");

    if (sdk) {
      sdk.shutdown();
    }
  });

  it("should not initialize tracing when disabled", () => {
    // Set environment variable
    process.env.TRACING_ENABLED = "false";

    const sdk = initializeTracing();
    assert.strictEqual(
      sdk,
      null,
      "Tracing SDK should not be initialized when disabled",
    );
  });

  it("should create spans when tracing is enabled", async () => {
    process.env.TRACING_ENABLED = "true";
    process.env.TRACE_EXPORTER = "console";

    const sdk = initializeTracing();

    let spanExecuted = false;
    const result = await createSpan(
      "test.span",
      async (span) => {
        spanExecuted = true;
        assert.ok(span, "Span should be provided");
        return "test-result";
      },
      { attributes: { "test.key": "test-value" } },
    );

    assert.strictEqual(
      result,
      "test-result",
      "Function should return expected result",
    );
    assert.strictEqual(spanExecuted, true, "Span function should be executed");

    if (sdk) {
      sdk.shutdown();
    }
  });
});
