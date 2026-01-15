import 'reflect-metadata';
import { Container, runApplication } from '@kiqjs/core';
import { LoggerService } from './services/LoggerService';
import { DataProcessorService } from './services/DataProcessorService';
import { FileReaderComponent } from './components/FileReaderComponent';
import { DebugComponent } from './components/DebugComponent';
import { AppConfiguration } from './config/AppConfiguration';

/**
 * Main CLI application demonstrating KiqJS Core features:
 * - Dependency Injection with automatic component scanning
 * - Configuration management with @Value
 * - Profile-based component activation with @Profile
 * - Resource loading with ResourceLoader
 * - Service and Component organization
 */
class Application {
  private container!: Container;

  async run(): Promise<void> {
    try {
      // Initialize KiqJS container (scans and registers all components)
      this.container = await runApplication(Application);

      // Resolve dependencies from container
      const logger = this.container.get(LoggerService);
      const processor = this.container.get(DataProcessorService);
      const fileReader = this.container.get(FileReaderComponent);
      const config = this.container.get(AppConfiguration);

      // Print application info
      console.log('\n' + '='.repeat(60));
      console.log(config.getAppInfo());
      console.log('='.repeat(60) + '\n');

      logger.info('Application started');

      // If debug profile is active, DebugComponent will be registered
      // Try to get it from container (optional)
      try {
        const debugComponent = this.container.get(DebugComponent);
        debugComponent.printDebugInfo({
          processorConfig: processor.getConfiguration()
        });
      } catch {
        // DebugComponent not registered (debug profile not active)
      }

      // List available resources
      logger.info('Listing resource files');
      const files = await fileReader.listResourceFiles();
      logger.info(`Found ${files.length} resource files`, { files });

      // Read data from resource file
      const data = await fileReader.readDataFile();

      if (data.length === 0) {
        logger.warn('No data to process');
        return;
      }

      // Process the data
      const results = await processor.processData(data);

      // Display results
      console.log('\n' + '='.repeat(60));
      console.log('PROCESSING RESULTS');
      console.log('='.repeat(60));
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result}`);
      });
      console.log('='.repeat(60) + '\n');

      logger.info('Application completed successfully');
    } catch (error) {
      console.error('Application error:', error);
      process.exit(1);
    }
  }
}

// Bootstrap the application (same pattern as HTTP examples)
new Application().run().catch(console.error);
