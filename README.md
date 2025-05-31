# Welcome to Colyseus!

This project has been created using [⚔️ `create-colyseus-app`](https://github.com/colyseus/create-colyseus-app/) - an npm init template for kick starting a Colyseus project in TypeScript.

[Documentation](http://docs.colyseus.io/)

## :crossed_swords: Usage

```
npm start
```

## 🔍 OpenTelemetry Tracing

This application includes comprehensive tracing instrumentation for monitoring and observability. See [TRACING.md](./TRACING.md) for detailed configuration and usage.

Quick start with tracing:

```bash
# Enable tracing with console output (development)
TRACING_ENABLED=true npm start

# Enable tracing with Jaeger exporter (production)
TRACING_ENABLED=true TRACE_EXPORTER=jaeger JAEGER_ENDPOINT=http://localhost:14268/api/traces npm start
```

## 🐳 Docker Deployment

This application can be containerized for production deployment. See [DOCKER.md](./DOCKER.md) for detailed instructions.

Quick start with Docker:

```bash
docker build -t snailmail .
docker run -p 2567:2567 snailmail
```

### Kubernetes & Helm

Deploy to Kubernetes using the provided Helm chart:

```bash
helm install snailmail helm/snailmail
```

The Helm chart includes TLS support via cert-manager and production-ready configurations.

## Structure

- `index.ts`: main entry point, register an empty room handler and attach [`@colyseus/monitor`](https://github.com/colyseus/colyseus-monitor)
- `src/rooms/MyRoom.ts`: an empty room handler for you to implement your logic
- `src/rooms/schema/MyRoomState.ts`: an empty schema used on your room's state.
- `loadtest/example.ts`: scriptable client for the loadtest tool (see `npm run loadtest`)
- `package.json`:
  - `scripts`:
    - `npm start`: runs `ts-node-dev index.ts`
    - `npm test`: runs mocha test suite
    - `npm run loadtest`: runs the [`@colyseus/loadtest`](https://github.com/colyseus/colyseus-loadtest/) tool for testing the connection, using the `loadtest/example.ts` script.
- `tsconfig.json`: TypeScript configuration file

## License

MIT
