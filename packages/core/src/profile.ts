import { getConfiguration } from './configuration';

/**
 * Get the active profile(s)
 *
 * Priority (highest to lowest):
 * 1. KIQ_PROFILES environment variable (comma-separated)
 * 2. kiq.profiles.active from application.yml
 * 3. NODE_ENV environment variable
 * 4. 'development' (default)
 *
 * Supports comma-separated profiles: "dev,local,debug"
 *
 * @returns Array of active profiles
 *
 * @example
 * // Using environment variable (highest priority)
 * // KIQ_PROFILES=production,monitoring node app.js
 * getActiveProfiles() // ['production', 'monitoring']
 *
 * @example
 * // Using YAML configuration
 * // kiq.profiles.active: development,debug
 * getActiveProfiles() // ['development', 'debug']
 */
export function getActiveProfiles(): string[] {
  // 1. Check KIQ_PROFILES environment variable (highest priority)
  const kiqProfilesEnv = process.env.KIQ_PROFILES;
  if (kiqProfilesEnv) {
    return kiqProfilesEnv.split(',').map((p) => p.trim()).filter(Boolean);
  }

  // 2. Check kiq.profiles.active from YAML
  try {
    const config = getConfiguration();
    if (config.has('kiq.profiles.active')) {
      const profiles = config.get<string>('kiq.profiles.active');
      return profiles.split(',').map((p) => p.trim()).filter(Boolean);
    }
  } catch {
    // Configuration not loaded yet, fallback to environment
  }

  // 3. Fallback to NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv) {
    return [nodeEnv.trim()];
  }

  // 4. Default
  return ['development'];
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
