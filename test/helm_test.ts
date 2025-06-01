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

  it("should create image update resources when enabled", async function () {
    this.timeout(10000);

    const testValues = `
imageUpdate:
  enabled: true
  schedule: "*/1 * * * *"
  alwaysPull: true
`;

    try {
      const { stdout, stderr } = await execAsync(
        `helm template test-release "${helmChart}" --set-string imageUpdate.enabled=true`,
      );
      assert.strictEqual(stderr, "");

      // Check that CronJob is created
      assert.ok(
        stdout.includes("kind: CronJob"),
        "Output should contain CronJob when imageUpdate.enabled=true",
      );

      // Check that RBAC resources are created
      assert.ok(
        stdout.includes("kind: ServiceAccount") &&
          stdout.includes("image-updater"),
        "Output should contain ServiceAccount for image updater",
      );
      assert.ok(
        stdout.includes("kind: Role") && stdout.includes("image-updater"),
        "Output should contain Role for image updater",
      );
      assert.ok(
        stdout.includes("kind: RoleBinding") &&
          stdout.includes("image-updater"),
        "Output should contain RoleBinding for image updater",
      );

      // Check that imagePullPolicy is set to Always
      assert.ok(
        stdout.includes("imagePullPolicy: Always"),
        "imagePullPolicy should be Always when imageUpdate is enabled",
      );
    } catch (error) {
      throw new Error(
        `Helm template failed with imageUpdate enabled: ${error.message}`,
      );
    }
  });

  it("should not create image update resources when disabled", async function () {
    this.timeout(10000);

    try {
      // Test with default values (imageUpdate.enabled should be false by default)
      const { stdout, stderr } = await execAsync(
        `helm template test-release "${helmChart}"`,
      );
      assert.strictEqual(stderr, "");

      // Check that CronJob is NOT created
      assert.ok(
        !stdout.includes("kind: CronJob"),
        "Output should not contain CronJob when imageUpdate.enabled=false (default)",
      );

      // Check that image updater RBAC resources are NOT created
      assert.ok(
        !stdout.includes("image-updater"),
        "Output should not contain image-updater resources when disabled",
      );

      // Check that imagePullPolicy remains as configured in values
      assert.ok(
        stdout.includes("imagePullPolicy: IfNotPresent"),
        "imagePullPolicy should remain IfNotPresent when imageUpdate is disabled",
      );
    } catch (error) {
      throw new Error(
        `Helm template failed with imageUpdate disabled: ${error.message}`,
      );
    }
  });
});
