# Daemon Worker Example

Long-running worker process with graceful shutdown using KiqJS Core.

## Features

- **Infinite Loop**: Worker runs continuously processing tasks
- **Graceful Shutdown**: Responds to SIGTERM/SIGINT signals
- **Configurable**: All parameters in `application.yml`
- **Task Processing**: Simulates background job processing
- **Error Handling**: Continues running despite errors

## Architecture

```
DaemonWorkerApplication
  └── WorkerService (runs infinite loop)
      ├── processTaskBatch()
      ├── processTask()
      └── stop() (graceful shutdown)
```

## Running

```bash
# Development mode (Ctrl+C to stop)
pnpm dev

# Production mode
pnpm dev:prod

# Build and run
pnpm build
pnpm start
```

## Configuration

`resources/application.yml`:

```yaml
kiq:
  profiles:
    active: development

worker:
  intervalMs: 3000              # Wait between batches
  batchSize: 5                   # Tasks per batch
  taskDurationMs: 500            # Simulated task time
  shutdownTimeoutMs: 10000       # Max shutdown wait
```

## Graceful Shutdown

The application handles shutdown signals properly:

1. **SIGTERM/SIGINT** received
2. Worker stops accepting new batches
3. Current batch finishes processing
4. Stats are logged
5. Process exits cleanly

If shutdown takes too long, the process is force-exited after `shutdownTimeoutMs`.

## Use Cases

- Background job processors
- Message queue consumers
- Data sync daemons
- Periodic task schedulers
- Health check monitors

## Testing Shutdown

```bash
# Start the daemon
pnpm dev

# In another terminal, find the process
ps aux | grep daemon-worker

# Send SIGTERM
kill -TERM <PID>

# Or just press Ctrl+C
```

## Output Example

```
======================================================================
KiqJS Daemon Worker v1.0.0 - Long-running worker with graceful shutdown
======================================================================

[INFO]: Starting worker daemon...
[INFO]: Worker started {"intervalMs":3000,"batchSize":5}
[INFO]: Processing batch {"batchSize":5,"taskIds":[1,2,3,4,5]}
[DEBUG]: Processing task {"id":1,"type":"email"}
[DEBUG]: Task completed {"id":1,"type":"email","totalProcessed":1}
...
^C[INFO]: Received SIGINT signal (Ctrl+C)
[INFO]: Initiating graceful shutdown...
[INFO]: Stats before shutdown {"running":true,"processedCount":15,"currentTaskId":16}
[INFO]: Stopping worker...
[INFO]: Worker stopped {"totalProcessed":15}
[INFO]: Graceful shutdown completed
[INFO]: Final stats {"running":false,"processedCount":15,"currentTaskId":16}
```

## Integration with Docker/Kubernetes

This pattern works well with container orchestration:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/Application.js"]
```

When the container receives `docker stop` or Kubernetes termination, it gracefully shuts down.
