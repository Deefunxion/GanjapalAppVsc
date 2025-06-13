// Storage utility for persistent data management
class AppStorage {
  static STORAGE_KEYS = {
    PLANT_PROFILES: 'ganjapal_plant_profiles',
    TIMELINE_EVENTS: 'ganjapal_timeline_events',
    APP_SETTINGS: 'ganjapal_app_settings'
  };

  // Plant Profiles Management
  static getPlantProfiles() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PLANT_PROFILES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading plant profiles:', error);
      return [];
    }
  }

  static savePlantProfiles(profiles) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PLANT_PROFILES, JSON.stringify(profiles));
      return true;
    } catch (error) {
      console.error('Error saving plant profiles:', error);
      return false;
    }
  }

  static addPlantProfile(profile) {
    const profiles = this.getPlantProfiles();
    profiles.push({
      ...profile,
      id: profile.id || Date.now().toString(),
      lastUpdated: new Date().toISOString()
    });
    return this.savePlantProfiles(profiles);
  }

  static updatePlantProfile(updatedProfile) {
    const profiles = this.getPlantProfiles();
    const index = profiles.findIndex(p => p.id === updatedProfile.id);
    if (index !== -1) {
      profiles[index] = {
        ...updatedProfile,
        lastUpdated: new Date().toISOString()
      };
      return this.savePlantProfiles(profiles);
    }
    return false;
  }

  static deletePlantProfile(profileId) {
    const profiles = this.getPlantProfiles();
    const filtered = profiles.filter(p => p.id !== profileId);
    return this.savePlantProfiles(filtered);
  }

  // Timeline Events Management
  static getTimelineEvents() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.TIMELINE_EVENTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading timeline events:', error);
      return [];
    }
  }

  static saveTimelineEvents(events) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.TIMELINE_EVENTS, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('Error saving timeline events:', error);
      return false;
    }
  }

  static addTimelineEvent(event) {
    const events = this.getTimelineEvents();
    events.push({
      ...event,
      id: event.id || Date.now().toString(),
      createdAt: new Date().toISOString()
    });
    return this.saveTimelineEvents(events);
  }

  // App Settings Management
  static getAppSettings() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.APP_SETTINGS);
      return stored ? JSON.parse(stored) : {
        theme: 'light',
        language: 'en',
        notifications: true
      };
    } catch (error) {
      console.error('Error loading app settings:', error);
      return { theme: 'light', language: 'en', notifications: true };
    }
  }

  static saveAppSettings(settings) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving app settings:', error);
      return false;
    }
  }

  // Utility methods
  static clearAllData() {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  static exportData() {
    return {
      plantProfiles: this.getPlantProfiles(),
      timelineEvents: this.getTimelineEvents(),
      appSettings: this.getAppSettings(),
      exportDate: new Date().toISOString()
    };
  }

  static importData(data) {
    try {
      if (data.plantProfiles) {
        this.savePlantProfiles(data.plantProfiles);
      }
      if (data.timelineEvents) {
        this.saveTimelineEvents(data.timelineEvents);
      }
      if (data.appSettings) {
        this.saveAppSettings(data.appSettings);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Make AppStorage globally available
if (typeof window !== 'undefined') {
  window.AppStorage = AppStorage;
}

export default AppStorage;

