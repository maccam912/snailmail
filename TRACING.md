# OpenTelemetry Tracing

This application includes comprehensive OpenTelemetry tracing instrumentation for monitoring and observability.

## Overview

The tracing implementation provides:

- **Automatic HTTP instrumentation** - All Express routes and middleware are automatically traced
- **Manual Colyseus room tracing** - Room lifecycle events (create, join, leave, dispose) and message handling
- **Configurable exporters** - Support for console logging, Jaeger, and OTLP exporters
- **Rich span attributes** - Room IDs, client session IDs, message content, and other contextual information

## Configuration

Tracing is controlled via environment variables:

### Basic Configuration

```bash
# Enable or disable tracing
TRACING_ENABLED=true

# Choose exporter type: console, jaeger, or otlp
TRACE_EXPORTER=console
```

### Console Exporter (Development)

The console exporter logs trace data to the console, useful for development and testing:

```bash
TRACING_ENABLED=true
TRACE_EXPORTER=console
```

### Jaeger Exporter

For Jaeger integration:

```bash
TRACING_ENABLED=true
TRACE_EXPORTER=jaeger
JAEGER_ENDPOINT=http://localhost:14268/api/traces
```

### OTLP Exporter (Recommended for Production)

For OpenTelemetry Protocol integration (works with Jaeger, Grafana Tempo, etc.):

```bash
TRACING_ENABLED=true
TRACE_EXPORTER=otlp
OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTLP_HEADERS={"Authorization":"Bearer your-api-key"}
```

## Docker Deployment

When deploying with Docker, set environment variables in your deployment configuration:

```bash
docker run -e TRACING_ENABLED=true -e TRACE_EXPORTER=otlp -e OTLP_ENDPOINT=http://your-collector:4318/v1/traces snailmail
```

## Kubernetes Deployment

Update your Helm values or Kubernetes manifests:

```yaml
env:
  TRACING_ENABLED: "true"
  TRACE_EXPORTER: "otlp"
  OTLP_ENDPOINT: "http://opentelemetry-collector:4318/v1/traces"
```

## Traced Operations

### Automatic Instrumentation

- HTTP requests to all Express routes (`/hello_world`, `/monitor`, etc.)
- Database operations (if using supported drivers)
- External HTTP calls (if using standard Node.js modules)

### Manual Instrumentation

**Room Lifecycle:**

- `room.onCreate` - Room creation with options and configuration
- `room.onJoin` - Client joining with session ID and current client count
- `room.onLeave` - Client leaving with session ID and consent status
- `room.onDispose` - Room disposal with final client count

**Message Handling:**

- `room.onMessage` - Client message processing with message type and content

### Span Attributes

Each traced operation includes relevant attributes:

- **Room operations**: `room.id`, `room.type`, `room.maxClients`, `room.clientCount`
- **Client operations**: `client.sessionId`, `client.consented`, `client.options`
- **HTTP operations**: `http.method`, `http.url`, `http.user_agent`, `http.remote_addr`
- **Messages**: `message.type`, `message.content`

## Development

### Running with Tracing

```bash
# Enable tracing for development
TRACING_ENABLED=true npm start

# Disable tracing (default)
npm start
```

### Testing

Run tests with tracing enabled:

```bash
TRACING_ENABLED=true npm test
```

The test suite includes specific tests for tracing functionality.

## Production Considerations

1. **Performance**: Tracing adds minimal overhead but consider the volume of traces in high-traffic scenarios
2. **Sampling**: Configure sampling rates in your trace collector to manage data volume
3. **Storage**: Ensure your trace backend (Jaeger, Tempo, etc.) has adequate storage
4. **Security**: Use OTLP_HEADERS to include authentication tokens for secure trace transmission

## Troubleshooting

### Tracing Not Working

1. Verify `TRACING_ENABLED=true` is set
2. Check that the trace exporter endpoint is accessible
3. Review console logs for OpenTelemetry initialization messages

### Missing Traces

1. Ensure the trace collector is running and accessible
2. Check network connectivity to the exporter endpoint
3. Verify authentication headers if required

### Console Output

When using the console exporter, traces will appear in application logs. In production, consider using structured logging to parse trace data.
