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

| Parameter                   | Description        | Default                                       |
| --------------------------- | ------------------ | --------------------------------------------- |
| `replicaCount`              | Number of replicas | `2`                                           |
| `image.repository`          | Image repository   | `harbor.rackspace.koski.co/library/snailmail` |
| `image.tag`                 | Image tag          | `latest`                                      |
| `image.pullPolicy`          | Image pull policy  | `IfNotPresent`                                |
| `service.type`              | Service type       | `ClusterIP`                                   |
| `service.port`              | Service port       | `2567`                                        |
| `ingress.enabled`           | Enable ingress     | `true`                                        |
| `ingress.className`         | Ingress class name | `nginx`                                       |
| `ingress.hosts[0].host`     | Hostname           | `snailmail.example.com`                       |
| `ingress.tls[0].secretName` | TLS secret name    | `snailmail-tls`                               |
| `resources.limits.cpu`      | CPU limit          | `500m`                                        |
| `resources.limits.memory`   | Memory limit       | `512Mi`                                       |
| `resources.requests.cpu`    | CPU request        | `100m`                                        |
| `resources.requests.memory` | Memory request     | `128Mi`                                       |
| `env.NODE_ENV`              | Node environment   | `production`                                  |

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
