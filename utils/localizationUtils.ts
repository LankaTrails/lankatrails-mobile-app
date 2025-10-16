import * as Localization from 'expo-localization';
import axios from 'axios';

/**
 * Collects all relevant localization preferences from the device.
 * This is useful for syncing user preferences to backend.
 */
export function getDeviceLocalization() {
  // Cast to any to safely access optional properties across different versions of expo-localization
  const L = Localization as any;

  const locale = L.locale ?? (Array.isArray(L.locales) && L.locales[0]) ?? 'en-US';
  const parts = String(locale).replace('_', '-').split('-');
  const languageCode = parts[0] ?? 'en';
  const languageTag = locale;
  const region = parts[1] ?? 'LK';
  const country = region;
  const currency = 'LKR';
  const timeZone =
    L.timezone ?? L.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Asia/Colombo';
  const is24HourClock =
    typeof L.is24Hour === 'boolean'
      ? L.is24Hour
      : typeof L.is24HourClock === 'boolean'
      ? L.is24HourClock
      : true;
  const measurementSystem = L.measurementSystem ?? 'metric';
  const temperatureUnit = L.temperatureUnit ?? 'celsius';

  console.log(languageCode, languageTag, country, region, currency, timeZone, is24HourClock, measurementSystem, temperatureUnit);

  return {
    languageCode,
    languageTag,
    country,
    region,
    currency,
    timeZone,
    is24HourClock,
    measurementSystem,
    temperatureUnit,
  };
}

/**
 * Syncs device localization info to backend user preferences endpoint.
 * Should be called after user login or during profile setup.
 */
export async function syncLocalizationPreferences(token: string) {
  const preferences = getDeviceLocalization();

  try {
    await axios.put(
      '/api/user/preferences',
      {
        preferredCurrency: preferences.currency,
        timeZone: preferences.timeZone,
        language: preferences.languageTag,
        is24Hour: preferences.is24HourClock,
        measurementSystem: preferences.measurementSystem,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Localization preferences synced successfully:', preferences);
  } catch (error) {
    if (error instanceof Error) {
      console.error('⚠️ Failed to sync localization preferences:', error.message);
    } else {
      console.error('⚠️ Failed to sync localization preferences:', error);
    }
  }
}
