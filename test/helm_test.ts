import assert from "assert";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

describe("Helm Template Validation", () => {
  const helmChart = path.join(__dirname, "..", "helm", "snailmail");
  const valuesProduction = path.join(helmChart, "values-production.yaml");
  const valuesLocal = path.join(helmChart, "values-local.yaml");

  before(async function () {
    this.timeout(10000);

    // Check if helm is available
    try {
      await execAsync("helm version --short");
    } catch (error) {
      this.skip();
    }
  });

  it("should template successfully with default values", async function () {
    this.timeout(10000);

    try {
      const { stdout, stderr } = await execAsync(
        `helm template test-release "${helmChart}"`,
      );
      assert.strictEqual(stderr, "");
      assert.ok(
        stdout.includes("apiVersion"),
        "Output should contain apiVersion",
      );
    } catch (error) {
      throw new Error(
        `Helm template failed with default values: ${error.message}`,
      );
    }
  });

  it("should template successfully with production values", async function () {
    this.timeout(10000);

    try {
      const { stdout, stderr } = await execAsync(
        `helm template test-release "${helmChart}" --values "${valuesProduction}"`,
      );
      assert.strictEqual(stderr, "");
      assert.ok(
        stdout.includes("apiVersion"),
        "Output should contain apiVersion",
      );
    } catch (error) {
      throw new Error(
        `Helm template failed with production values: ${error.message}`,
      );
    }
  });

  it("should template successfully with local values", async function () {
    this.timeout(10000);

    try {
      const { stdout, stderr } = await execAsync(
        `helm template test-release "${helmChart}" --values "${valuesLocal}"`,
      );
      assert.strictEqual(stderr, "");
      assert.ok(
        stdout.includes("apiVersion"),
        "Output should contain apiVersion",
      );
    } catch (error) {
      throw new Error(
        `Helm template failed with local values: ${error.message}`,
      );
    }
  });

  it("should pass helm lint validation", async function () {
    this.timeout(10000);

    try {
      const { stdout, stderr } = await execAsync(`helm lint "${helmChart}"`);
      assert.ok(
        stdout.includes("1 chart(s) linted, 0 chart(s) failed"),
        "Helm lint should pass with no failures",
      );
    } catch (error) {
      throw new Error(`Helm lint failed: ${error.message}`);
    }
  });
});
