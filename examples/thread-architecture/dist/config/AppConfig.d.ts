/**
 * Application Configuration
 * Configurações explícitas de infraestrutura
 */
export declare class AppConfig {
    appSettings(): {
        name: string;
        version: string;
        env: string;
    };
    serverConfig(): {
        port: number;
        host: string;
    };
    featureFlags(): {
        userCreation: boolean;
        userActivation: boolean;
        eventPublishing: boolean;
    };
}
