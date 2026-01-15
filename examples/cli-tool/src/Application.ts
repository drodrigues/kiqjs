import 'reflect-metadata';
import { Component, Container, Inject, runApplication } from '@kiqjs/core';
import { LoggerService } from './services/LoggerService';
import { DataProcessorService } from './services/DataProcessorService';
import { FileReaderComponent } from './components/FileReaderComponent';
import { DebugComponent } from './components/DebugComponent';
import { AppConfiguration } from './config/AppConfiguration';

/**
 * Main CLI application demonstrating KiqJS Core features:
 * - Dependency Injection with @Component and @Inject
 * - Configuration management with @Value
 * - Profile-based component activation with @Profile
 * - Resource loading with ResourceLoader
 * - Service and Component organization
 */
@Component()
class CliToolApplication {
  @Inject()
  private logger!: LoggerService;

  @Inject()
  private processor!: DataProcessorService;

  @Inject()
  private fileReader!: FileReaderComponent;

  @Inject()
  private config!: AppConfiguration;

  @Inject()
  private container!: Container;

  async run(): Promise<void> {
    try {
      // Print application info
      console.log('\n' + '='.repeat(60));
      console.log(this.config.getAppInfo());
      console.log('='.repeat(60) + '\n');

      this.logger.info('Application started');

      // If debug profile is active, DebugComponent will be registered
      // Try to get it from container (optional)
      try {
        const debugComponent = this.container.get(DebugComponent);
        debugComponent.printDebugInfo({
          processorConfig: this.processor.getConfiguration()
        });
      } catch {
        // DebugComponent not registered (debug profile not active)
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
  try {
    // runApplication() automatically:
    // - Scans and registers all components
    // - Creates the container
    // - Resolves dependencies
    // - Returns the container
    const container = await runApplication(CliToolApplication);

    // Get the application instance and run it
    const app = container.get(CliToolApplication);
    await app.run();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
