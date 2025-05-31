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

The container is designed to be deployed on Kubernetes. See the `k8s/` directory for example configurations.

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

Example deployment files are provided in the `k8s/` directory:

- `deployment.yaml` - Kubernetes Deployment with resource limits and health checks
- `service.yaml` - Service and Ingress configuration

Deploy to Kubernetes:

```bash
kubectl apply -f k8s/
```

Make sure to update the ingress hostname in `k8s/service.yaml` to match your domain.
