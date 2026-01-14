import { Service } from '@kiqjs/core';
import { ResourceLoader } from '@kiqjs/core';

/**
 * Template Service
 * Demonstrates ResourceLoader usage for loading templates from resources/ folder
 * Similar to Spring Boot's ResourceLoader
 */
@Service()
export class TemplateService {
  private resourceLoader: ResourceLoader;

  constructor() {
    // Initialize ResourceLoader (auto-detects resources/ directory)
    this.resourceLoader = new ResourceLoader();
  }

  /**
   * Load and render welcome email template
   *
   * @param username User's name
   * @param email User's email
   * @param accountType Account type
   * @returns Rendered HTML email
   */
  renderWelcomeEmail(username: string, email: string, accountType: string = 'Standard'): string {
    // Load template from resources/templates/
    const template = this.resourceLoader.getResourceAsString('templates/welcome-email.html');

    // Simple template replacement (in production, use a proper template engine)
    return template
      .replace('{{username}}', username)
      .replace('{{email}}', email)
      .replace('{{accountType}}', accountType);
  }

  /**
   * Check if a template exists
   *
   * @param templatePath Path to template relative to resources/
   * @returns True if template exists
   */
  templateExists(templatePath: string): boolean {
    return this.resourceLoader.exists(templatePath);
  }

  /**
   * List all available templates
   *
   * @returns Array of template filenames
   */
  listTemplates(): string[] {
    try {
      return this.resourceLoader.listResources('templates');
    } catch (error) {
      return [];
    }
  }

  /**
   * Load any resource as string
   * Useful for loading config files, static assets, etc.
   *
   * @param resourcePath Path relative to resources/
   * @returns Resource content as string
   */
  loadResource(resourcePath: string): string {
    return this.resourceLoader.getResourceAsString(resourcePath);
  }
}
