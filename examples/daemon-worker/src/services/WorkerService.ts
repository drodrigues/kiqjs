import { Service, Value, Inject } from '@kiqjs/core';
import { LoggerService } from './LoggerService';

/**
 * Worker service that runs continuously processing tasks
 * Demonstrates:
 * - Infinite loop pattern
 * - Graceful shutdown
 * - Task processing with delays
 */
@Service()
export class WorkerService {
  @Inject()
  private logger!: LoggerService;

  @Value('worker.intervalMs')
  private intervalMs!: number;

  @Value('worker.batchSize')
  private batchSize!: number;

  @Value('worker.taskDurationMs')
  private taskDurationMs!: number;

  private running = false;
  private currentTaskId = 1;
  private processedCount = 0;

  /**
   * Start the worker loop
   */
  async start(): Promise<void> {
    this.running = true;
    this.logger.info('Worker started', {
      intervalMs: this.intervalMs,
      batchSize: this.batchSize
    });

    while (this.running) {
      try {
        await this.processTaskBatch();

        // Wait before next batch (only if still running)
        if (this.running) {
          await this.sleep(this.intervalMs);
        }
      } catch (error) {
        this.logger.error('Error processing batch', error);
        // Continue running even on error
        await this.sleep(1000);
      }
    }

    this.logger.info('Worker stopped', { totalProcessed: this.processedCount });
  }

  /**
   * Stop the worker gracefully
   * Allows current batch to finish
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping worker...');
    this.running = false;
  }

  /**
   * Check if worker is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      running: this.running,
      processedCount: this.processedCount,
      currentTaskId: this.currentTaskId
    };
  }

  /**
   * Process a batch of tasks
   */
  private async processTaskBatch(): Promise<void> {
    const tasksToProcess = this.generateTasks(this.batchSize);

    this.logger.info('Processing batch', {
      batchSize: tasksToProcess.length,
      taskIds: tasksToProcess.map(t => t.id)
    });

    for (const task of tasksToProcess) {
      if (!this.running) {
        this.logger.warn('Worker stopped, aborting batch');
        break;
      }

      await this.processTask(task);
    }
  }

  /**
   * Process a single task
   */
  private async processTask(task: { id: number; type: string }): Promise<void> {
    this.logger.debug('Processing task', task);

    // Simulate work
    await this.sleep(this.taskDurationMs);

    this.processedCount++;
    this.logger.debug('Task completed', { ...task, totalProcessed: this.processedCount });
  }

  /**
   * Generate mock tasks
   */
  private generateTasks(count: number): Array<{ id: number; type: string }> {
    const tasks = [];
    for (let i = 0; i < count; i++) {
      tasks.push({
        id: this.currentTaskId++,
        type: ['email', 'notification', 'report', 'cleanup'][Math.floor(Math.random() * 4)]
      });
    }
    return tasks;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
