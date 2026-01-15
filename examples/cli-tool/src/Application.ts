import 'reflect-metadata';
import { Container, scanAndRegister } from '@kiqjs/core';
import { LoggerService } from './services/LoggerService';
import { DataProcessorService } from './services/DataProcessorService';
import { FileReaderComponent } from './components/FileReaderComponent';
import { DebugComponent } from './components/DebugComponent';
import { AppConfiguration } from './config/AppConfiguration';

/**
 * Main CLI application demonstrating KiqJS Core features:
 * - Dependency Injection with Container
 * - Configuration management with @Value
 * - Profile-based component activation with @Profile
 * - Resource loading with ResourceLoader
 * - Service and Component organization
 */
class CliToolApplication {
  constructor(
    private logger: LoggerService,
    private processor: DataProcessorService,
    private fileReader: FileReaderComponent,
    private config: AppConfiguration,
    private debugComponent?: DebugComponent
  ) {}

  async run(): Promise<void> {
    try {
      // Print application info
      console.log('\n' + '='.repeat(60));
      console.log(this.config.getAppInfo());
      console.log('='.repeat(60) + '\n');

      this.logger.info('Application started');

      // If debug profile is active, print debug info
      if (this.debugComponent) {
        this.debugComponent.printDebugInfo({
          processorConfig: this.processor.getConfiguration()
        });
      }

      // List available resources
      this.logger.info('Listing resource files');
      const files = await this.fileReader.listResourceFiles();
      this.logger.info(`Found ${files.length} resource files`, { files });

      // Read data from resource file
      const data = await this.fileReader.readDataFile();

      if (data.length === 0) {
        this.logger.warn('No data to process');
        return;
      }

      // Process the data
      const results = await this.processor.processData(data);

      // Display results
      console.log('\n' + '='.repeat(60));
      console.log('PROCESSING RESULTS');
      console.log('='.repeat(60));
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result}`);
      });
      console.log('='.repeat(60) + '\n');

      this.logger.info('Application completed successfully');
    } catch (error) {
      this.logger.error('Application error', error);
      process.exit(1);
    }
  }
}

// Bootstrap the application
async function bootstrap() {
  // Scan and register all components
  await scanAndRegister(__dirname);

  // Create container
  const container = new Container();

  // Resolve services from container
  const logger = container.get(LoggerService);
  const processor = container.get(DataProcessorService);
  const fileReader = container.get(FileReaderComponent);
  const config = container.get(AppConfiguration);

  // DebugComponent is optional - only available when 'debug' profile is active
  let debugComponent: DebugComponent | undefined;
  try {
    debugComponent = container.get(DebugComponent);
  } catch (e) {
    // DebugComponent not registered (debug profile not active)
  }

  // Create and run application
  const app = new CliToolApplication(logger, processor, fileReader, config, debugComponent);
  await app.run();
}

bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
