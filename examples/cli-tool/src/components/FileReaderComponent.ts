import { Component, Inject } from '@kiqjs/core';
import { ResourceLoader } from '@kiqjs/core';
import { LoggerService } from '../services/LoggerService';

/**
 * Component that demonstrates ResourceLoader usage
 */
@Component()
export class FileReaderComponent {
  @Inject()
  private logger!: LoggerService;

  @Inject()
  private resourceLoader!: ResourceLoader;

  async readDataFile(): Promise<string[]> {
    this.logger.info('Reading data file from resources');

    try {
      const content = this.resourceLoader.getResourceAsString('data.txt');
      const lines = content.split('\n').filter((line: string) => line.trim().length > 0);

      this.logger.debug('File read successfully', { lineCount: lines.length });
      return lines;
    } catch (error) {
      this.logger.error('Failed to read data file', error);
      return [];
    }
  }

  async listResourceFiles(): Promise<string[]> {
    this.logger.info('Listing resource files');

    try {
      const files = this.resourceLoader.listResources();
      this.logger.debug('Resource files found', { files });
      return files;
    } catch (error) {
      this.logger.error('Failed to list resource files', error);
      return [];
    }
  }
}
