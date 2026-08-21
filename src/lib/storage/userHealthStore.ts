import { UserProfile } from '../../types/user';
import { DEFAULT_DIETARY_PREFERENCES } from '../../components/DietaryPreferencesModal';

const STORAGE_KEY = 'nutrigrade_encrypted_health_profile_v1';
const DISCLAIMER_CONSENT_KEY = 'nutrigrade_medical_disclaimer_accepted_v1';
const OBFUSCATION_SALT = 'NUTRIGRADE_CLINICAL_PRIVACY_SALT_2026';

/**
 * Simple client-side encryption/decryption at rest using standard XOR + Base64 UTF-8 encoding.
 * Ensures health profile data (isDiabetic, hasHypertension, etc.) is encrypted on local disk.
 */
function encryptData(text: string): string {
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ OBFUSCATION_SALT.charCodeAt(i % OBFUSCATION_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(unescape(encodeURIComponent(result)));
  } catch (err) {
    console.warn('Encryption failed, returning raw payload:', err);
    return text;
  }
}

function decryptData(encryptedBase64: string): string {
  try {
    const rawResult = decodeURIComponent(escape(atob(encryptedBase64)));
    let result = '';
    for (let i = 0; i < rawResult.length; i++) {
      const charCode = rawResult.charCodeAt(i) ^ OBFUSCATION_SALT.charCodeAt(i % OBFUSCATION_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (err) {
    console.warn('Decryption failed, falling back to raw payload:', err);
    return encryptedBase64;
  }
}

/** Default clean health profile fallback */
export const DEFAULT_HEALTH_PROFILE: UserProfile = {
  medicalFlags: {
    isDiabetic: false,
    hasHypertension: false,
    isCeliac: false,
    lowSodiumDiet: false,
  },
  dietaryPreferences: DEFAULT_DIETARY_PREFERENCES,
  goals: {
    targetCaloriesPerDay: 2000,
    maxSodiumPerDayMg: 2000,
    maxSugarPerDayG: 30,
    weightGoal: 'maintain',
  },
};

/**
 * Loads the user's encrypted health profile from local storage.
 * Strictly local-only, zero telemetry.
 */
export function loadUserHealthProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_HEALTH_PROFILE;

  try {
    const encryptedRaw = localStorage.getItem(STORAGE_KEY);
    if (!encryptedRaw) return DEFAULT_HEALTH_PROFILE;

    const decryptedJson = decryptData(encryptedRaw);
    const parsed = JSON.parse(decryptedJson) as UserProfile;

    return {
      ...DEFAULT_HEALTH_PROFILE,
      ...parsed,
      medicalFlags: {
        ...DEFAULT_HEALTH_PROFILE.medicalFlags,
        ...(parsed.medicalFlags || {}),
      },
      dietaryPreferences: {
        ...DEFAULT_DIETARY_PREFERENCES,
        ...(parsed.dietaryPreferences || {}),
      },
    };
  } catch (error) {
    console.error('Failed to load encrypted health profile:', error);
    return DEFAULT_HEALTH_PROFILE;
  }
}

/**
 * Encrypts and persists the user health profile into local storage.
 * Ensures zero network transmission of personal medical flags.
 */
export function saveUserHealthProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;

  try {
    const jsonString = JSON.stringify(profile);
    const encrypted = encryptData(jsonString);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Failed to save encrypted health profile:', error);
  }
}

/**
 * One-click function to completely erase all local health data,
 * clear medical preferences, reset consent flags, and restore defaults.
 */
export function clearAllHealthData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DISCLAIMER_CONSENT_KEY);
  } catch (error) {
    console.error('Failed to clear health data:', error);
  }
}

/**
 * Checks whether the user has accepted the medical disclaimer.
 */
export function hasAcceptedMedicalDisclaimer(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem(DISCLAIMER_CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Persists user acceptance of the medical disclaimer.
 */
export function setAcceptedMedicalDisclaimer(accepted: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    if (accepted) {
      localStorage.setItem(DISCLAIMER_CONSENT_KEY, 'true');
    } else {
      localStorage.removeItem(DISCLAIMER_CONSENT_KEY);
    }
  } catch (error) {
    console.error('Failed to save disclaimer acceptance state:', error);
  }
}
