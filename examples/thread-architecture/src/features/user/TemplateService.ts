import { ResourceLoader, Service } from '@kiqjs/core';

@Service()
export class TemplateService {
  private resourceLoader: ResourceLoader;

  constructor() {
    this.resourceLoader = new ResourceLoader();
  }

  renderWelcomeEmail(username: string, email: string, accountType: string = 'Standard'): string {
    const template = this.resourceLoader.getResourceAsString('templates/welcome-email.html');

    return template
      .replace('{{username}}', username)
      .replace('{{email}}', email)
      .replace('{{accountType}}', accountType);
  }

  templateExists(templatePath: string): boolean {
    return this.resourceLoader.exists(templatePath);
  }

  listTemplates(): string[] {
    try {
      return this.resourceLoader.listResources('templates');
    } catch (error) {
      return [];
    }
  }

  loadResource(resourcePath: string): string {
    return this.resourceLoader.getResourceAsString(resourcePath);
  }
}
