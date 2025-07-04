# Snailmail Helm Chart

This Helm chart deploys the Snailmail Colyseus game server on Kubernetes with TLS support via cert-manager.

## Prerequisites

- Kubernetes 1.16+
- Helm 3.0+
- NGINX Ingress Controller
- cert-manager (for TLS certificates)

## Installing the Chart

To install the chart with the release name `snailmail`:

```bash
helm install snailmail helm/snailmail
```

To install with custom values:

```bash
helm install snailmail helm/snailmail --values my-values.yaml
```

### Example Configurations

The chart includes example values files for common scenarios:

- `values-production.yaml` - Production deployment with autoscaling and higher resources
- `values-local.yaml` - Local development without TLS

```bash
# Install for production
helm install snailmail helm/snailmail --values helm/snailmail/values-production.yaml

# Install for local development
helm install snailmail helm/snailmail --values helm/snailmail/values-local.yaml
```

## Uninstalling the Chart

To uninstall/delete the `snailmail` deployment:

```bash
helm delete snailmail
```

## Configuration

The following table lists the configurable parameters of the Snailmail chart and their default values.

| Parameter                   | Description         | Default                                       |
| --------------------------- | ------------------- | --------------------------------------------- |
| `replicaCount`              | Number of replicas  | `2`                                           |
| `image.repository`          | Image repository    | `harbor.rackspace.koski.co/library/snailmail` |
| `image.tag`                 | Image tag           | `latest`                                      |
| `image.pullPolicy`          | Image pull policy   | `IfNotPresent`                                |
| `service.type`              | Service type        | `ClusterIP`                                   |
| `service.port`              | Service port        | `2567`                                        |
| `ingress.enabled`           | Enable ingress      | `true`                                        |
| `ingress.className`         | Ingress class name  | `nginx`                                       |
| `ingress.hosts[0].host`     | Hostname            | `snailmail.example.com`                       |
| `ingress.tls[0].secretName` | TLS secret name     | `snailmail-tls`                               |
| `resources.limits.cpu`      | CPU limit           | `500m`                                        |
| `resources.limits.memory`   | Memory limit        | `512Mi`                                       |
| `resources.requests.cpu`    | CPU request         | `100m`                                        |
| `resources.requests.memory` | Memory request      | `128Mi`                                       |
| `env.NODE_ENV`              | Node environment    | `production`                                  |
| `imageUpdate.enabled`       | Enable auto updates | `false`                                       |
| `imageUpdate.schedule`      | Update schedule     | `*/1 * * * *`                                 |
| `imageUpdate.alwaysPull`    | Force Always policy | `true`                                        |

## TLS Configuration

The chart includes TLS support using cert-manager. By default, it uses the `letsencrypt-prod` cluster issuer. Make sure you have cert-manager installed and configured in your cluster.

### Example values for custom domain:

```yaml
ingress:
  hosts:
    - host: snailmail.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: snailmail-tls
      hosts:
        - snailmail.yourdomain.com
```

## Resource Configuration

The chart includes default resource limits suitable for production use:

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

## Autoscaling

Horizontal Pod Autoscaler (HPA) can be enabled:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

## Health Checks

The chart includes configured health checks:

- **Liveness Probe**: `/hello_world` endpoint
- **Readiness Probe**: `/hello_world` endpoint

## WebSocket Support

The ingress is configured to support WebSocket connections required by the Colyseus game server:

- Proxy timeouts are set to 3600 seconds
- WebSocket services annotation is included
- Proper path routing for the game server

## Monitoring

The application includes a monitoring endpoint at `/monitor` (password protected in production).

## OpenTelemetry Tracing

The chart supports OpenTelemetry tracing configuration through environment variables:

```yaml
env:
  TRACING_ENABLED: "true"
  TRACE_EXPORTER: "otlp"
  OTLP_ENDPOINT: "http://opentelemetry-collector:4318/v1/traces"
  OTLP_HEADERS: '{"Authorization":"Bearer your-token"}'
```

Available exporters:

- `console` - Logs traces to console (development)
- `jaeger` - Sends traces to Jaeger collector
- `otlp` - Sends traces via OpenTelemetry Protocol (recommended)

See [TRACING.md](../../TRACING.md) for detailed configuration options.

## Automatic Image Updates

The chart supports automatic image updates through a configurable CronJob. When enabled, it periodically checks for new images and performs rolling restarts to pull the latest version.

### Configuration

```yaml
imageUpdate:
  # Enable automatic image updates
  enabled: true
  # Cron schedule for checking updates (every minute by default)
  schedule: "*/1 * * * *"
  # Force imagePullPolicy to Always when enabled
  alwaysPull: true
```

### How It Works

1. **Image Pull Policy**: When `imageUpdate.enabled` is `true` and `alwaysPull` is `true`, the deployment's `imagePullPolicy` is automatically set to `Always`
2. **Scheduled Updates**: A CronJob runs on the specified schedule to trigger rolling restarts
3. **Rolling Restart**: The CronJob uses `kubectl rollout restart` to perform a zero-downtime restart
4. **RBAC**: Appropriate ServiceAccount, Role, and RoleBinding are created for the updater

### Production Example

For production deployments with less frequent checks:

```yaml
imageUpdate:
  enabled: true
  schedule: "*/5 * * * *" # Every 5 minutes
  alwaysPull: true
```

### Security Considerations

- The image updater only has permissions to restart deployments in the same namespace
- Uses a dedicated ServiceAccount with minimal required permissions
- Jobs are limited in history to prevent resource accumulation

**Note**: This feature is designed for environments where you want automatic updates of the `latest` tag. For more sophisticated image update strategies, consider using tools like Flux or ArgoCD.
