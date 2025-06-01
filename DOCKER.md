# Docker Deployment

This repository includes Docker configuration for containerized deployment of the Snailmail game server.

## Docker Build

The application uses a multi-stage Dockerfile to create a minimal production image:

```bash
# Build the image
docker build -t snailmail .

# Run the container
docker run -p 2567:2567 snailmail
```

## Docker Compose

For local development and testing:

```bash
docker-compose up
```

This will build and run the application with proper health checks.

## Production Deployment

The container is designed to be deployed on Kubernetes using the provided Helm chart.

### Environment Variables

- `NODE_ENV=production` - Enables production mode (static file serving instead of playground)

### Exposed Ports

- `2567` - Main game server port (HTTP + WebSocket)

### Health Checks

- Health check endpoint: `/hello_world`
- The container includes built-in health checks for Kubernetes deployments

## GitHub Actions

The repository includes automated Docker image building via GitHub Actions:

- **Trigger**: Push to `main` branch, pull requests, or manual workflow dispatch
- **Registry**: Harbor registry at `harbor.rackspace.koski.co`
- **Tags**: `latest` for main branch, SHA and branch names for other pushes
- **Platforms**: Multi-arch build (linux/amd64, linux/arm64)

### Required Secrets

Set these in your GitHub repository settings:

- `HARBOR_USERNAME` - Username for Harbor registry
- `HARBOR_PASSWORD` - Password for Harbor registry

## Kubernetes Deployment

### Helm Chart

A Helm chart is provided in the `helm/snailmail/` directory with TLS support via cert-manager:

```bash
# Install with default values
helm install snailmail helm/snailmail

# Install with custom values
helm install snailmail helm/snailmail --set ingress.hosts[0].host=snailmail.yourdomain.com
```

The Helm chart includes:

- TLS certificates via cert-manager
- Configurable ingress with WebSocket support
- Horizontal Pod Autoscaler support
- Production-ready resource limits
- Health checks and monitoring

See [helm/snailmail/README.md](helm/snailmail/README.md) for detailed configuration options.
