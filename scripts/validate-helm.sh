#!/bin/bash

# Helm Template Validation Script
# This script validates that all Helm templates can be generated without errors

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
HELM_CHART="${REPO_ROOT}/helm/snailmail"

echo "🔍 Validating Helm templates..."

# Check if helm is available
if ! command -v helm &> /dev/null; then
    echo "⚠️  Warning: helm command not found. Skipping Helm validation."
    echo "   Install Helm to run full validation: https://helm.sh/docs/intro/install/"
    exit 0
fi

# Validate with default values
echo "📋 Testing with default values..."
if ! helm template test-release "${HELM_CHART}" > /dev/null; then
    echo "❌ Failed to template with default values"
    exit 1
fi
echo "✅ Default values template validation passed"

# Validate with production values
echo "📋 Testing with production values..."
if ! helm template test-release "${HELM_CHART}" --values "${HELM_CHART}/values-production.yaml" > /dev/null; then
    echo "❌ Failed to template with production values"
    exit 1
fi
echo "✅ Production values template validation passed"

# Validate with local values
echo "📋 Testing with local values..."
if ! helm template test-release "${HELM_CHART}" --values "${HELM_CHART}/values-local.yaml" > /dev/null; then
    echo "❌ Failed to template with local values"
    exit 1
fi
echo "✅ Local values template validation passed"

# Validate chart syntax
echo "📋 Testing chart syntax..."
if ! helm lint "${HELM_CHART}" > /dev/null; then
    echo "❌ Chart linting failed"
    exit 1
fi
echo "✅ Chart syntax validation passed"

echo "🎉 All Helm template validations passed!"