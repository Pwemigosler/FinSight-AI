
import { AvatarSettings, UserPreferences } from "../../../types/user";

/**
 * Service responsible for providing default values for user-related objects
 */
export class DefaultsService {
  /**
   * Returns default avatar settings
   */
  getDefaultAvatarSettings(): AvatarSettings {
    return {
      zoom: 100,
      position: { x: 0, y: 0 }
    };
  }

  /**
   * Returns default user preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      assistantCharacter: 'fin',
      notifications: true,
      emailNotifications: true,
      appNotifications: true,
      currencyFormat: 'usd',
      dateFormat: 'MM/DD/YYYY',
      language: 'en'
    };
  }
}
