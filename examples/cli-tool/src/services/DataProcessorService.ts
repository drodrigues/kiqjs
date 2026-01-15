import { Service, Value, Inject } from '@kiqjs/core';
import { LoggerService } from './LoggerService';

/**
 * Data processor service that demonstrates dependency injection and configuration
 */
@Service()
export class DataProcessorService {
  @Inject()
  private logger!: LoggerService;

  @Value('processor.batchSize')
  private batchSize!: number;

  @Value('processor.timeout')
  private timeout!: number;

  @Value('processor.enabled')
  private enabled!: boolean;

  async processData(data: string[]): Promise<string[]> {
    if (!this.enabled) {
      this.logger.warn('Processor is disabled');
      return [];
    }

    this.logger.info(`Processing ${data.length} items with batch size ${this.batchSize}`);

    const results: string[] = [];

    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);
      this.logger.debug(`Processing batch ${i / this.batchSize + 1}`, {
        batchSize: batch.length
      });

      // Simulate processing with timeout
      await this.processBatch(batch);

      results.push(...batch.map(item => `[PROCESSED] ${item}`));
    }

    this.logger.info('Processing completed', { totalProcessed: results.length });
    return results;
  }

  private processBatch(batch: string[]): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.logger.debug('Batch processing completed');
        resolve();
      }, Math.min(this.timeout / 10, 100)); // Quick simulation
    });
  }

  getConfiguration(): any {
    return {
      batchSize: this.batchSize,
      timeout: this.timeout,
      enabled: this.enabled
    };
  }
}
