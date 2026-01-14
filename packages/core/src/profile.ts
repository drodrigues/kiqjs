import { getConfiguration } from './configuration';

/**
 * Get the active profile(s)
 *
 * Priority:
 * 1. spring.profiles.active from application.yml (Spring Boot compatibility)
 * 2. NODE_ENV environment variable
 * 3. 'development' (default)
 *
 * Supports comma-separated profiles: "dev,local"
 *
 * @returns Array of active profiles
 */
export function getActiveProfiles(): string[] {
  try {
    const config = getConfiguration();

    // Check spring.profiles.active (Spring Boot compatibility)
    if (config.has('spring.profiles.active')) {
      const profiles = config.get<string>('spring.profiles.active');
      return profiles.split(',').map((p) => p.trim());
    }
  } catch {
    // Configuration not loaded yet, fallback to environment
  }

  // Fallback to NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  return [nodeEnv];
}

/**
 * Check if a profile expression matches the active profiles
 *
 * Supports:
 * - Single profile: 'dev'
 * - Multiple profiles: ['dev', 'test']
 * - Negation: '!prod' (all except prod)
 * - Array with negation: ['!prod', '!staging']
 *
 * @param profileExpr Profile expression (string or array of strings)
 * @returns True if the profile expression matches
 *
 * @example
 * // Active profile: 'development'
 * isProfileActive('development') // true
 * isProfileActive('production') // false
 * isProfileActive('!production') // true
 * isProfileActive(['development', 'test']) // true
 */
export function isProfileActive(profileExpr: string | string[]): boolean {
  const activeProfiles = getActiveProfiles();
  const profiles = Array.isArray(profileExpr) ? profileExpr : [profileExpr];

  // If any profile in the expression matches, return true
  return profiles.some((profile) => {
    if (profile.startsWith('!')) {
      // Negation: '!prod' means "not prod"
      const negatedProfile = profile.slice(1);
      return !activeProfiles.includes(negatedProfile);
    } else {
      // Normal: 'dev' means "is dev"
      return activeProfiles.includes(profile);
    }
  });
}

/**
 * Check if a component should be active based on its profile metadata
 *
 * @param profileMetadata Profile metadata from @Profile decorator
 * @returns True if component should be active
 */
export function shouldActivateComponent(profileMetadata?: string | string[]): boolean {
  // No profile metadata means always active
  if (!profileMetadata) {
    return true;
  }

  return isProfileActive(profileMetadata);
}
