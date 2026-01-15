import 'reflect-metadata';
import { Component, Inject, runApplication } from '@kiqjs/core';
import { LoggerService } from './services/LoggerService';
import { WorkerService } from './services/WorkerService';
import { AppConfiguration } from './config/AppConfiguration';

/**
 * Daemon Worker Application
 *
 * Demonstrates:
 * - Long-running process with infinite loop
 * - Graceful shutdown on SIGTERM/SIGINT
 * - Task processing with configurable intervals
 * - Proper cleanup before exit
 */
@Component()
class DaemonWorkerApplication {
  @Inject()
  private logger!: LoggerService;

  @Inject()
  private worker!: WorkerService;

  @Inject()
  private config!: AppConfiguration;

  private isShuttingDown = false;

  async run(): Promise<void> {
    // Print application info
    console.log('\n' + '='.repeat(70));
    console.log(this.config.getAppInfo());
    console.log('='.repeat(70) + '\n');

    // Setup graceful shutdown handlers
    this.setupShutdownHandlers();

    // Start the worker (runs indefinitely until stopped)
    this.logger.info('Starting worker daemon...');
    await this.worker.start();

    // This line is only reached after worker.stop() is called
    this.logger.info('Worker daemon stopped');
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupShutdownHandlers(): void {
    // Handle SIGTERM (docker stop, kubernetes termination)
    process.on('SIGTERM', () => {
      this.logger.info('Received SIGTERM signal');
      this.gracefulShutdown();
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      this.logger.info('Received SIGINT signal (Ctrl+C)');
      this.gracefulShutdown();
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      this.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      this.gracefulShutdown();
    });

    process.on('unhandledRejection', (reason: any) => {
      this.logger.error('Unhandled promise rejection', { reason });
      this.gracefulShutdown();
    });
  }

  /**
   * Gracefully shutdown the application
   * - Stop accepting new tasks
   * - Wait for current tasks to complete
   * - Force exit if timeout is reached
   */
  private gracefulShutdown(): void {
    if (this.isShuttingDown) {
      this.logger.warn('Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;

    this.logger.info('Initiating graceful shutdown...');
    this.logger.info('Stats before shutdown', this.worker.getStats());

    // Stop the worker (allows current batch to finish)
    this.worker.stop();

    // Setup force exit timeout
    const timeout = setTimeout(() => {
      this.logger.error('Graceful shutdown timeout exceeded, forcing exit');
      process.exit(1);
    }, this.config.shutdownTimeoutMs);

    // Wait for worker to fully stop
    const checkInterval = setInterval(() => {
      if (!this.worker.isRunning()) {
        clearInterval(checkInterval);
        clearTimeout(timeout);

        this.logger.info('Graceful shutdown completed');
        this.logger.info('Final stats', this.worker.getStats());

        // Give time for logs to flush
        setTimeout(() => {
          process.exit(0);
        }, 100);
      }
    }, 100);
  }
}

// Bootstrap the application
async function bootstrap() {
  try {
    const container = await runApplication(DaemonWorkerApplication);
    const app = container.get(DaemonWorkerApplication);
    await app.run();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
