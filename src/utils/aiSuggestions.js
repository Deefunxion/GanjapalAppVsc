// AI Suggestions Engine for Cannabis Growing
import { samplePlants } from '../data/plantData';

export class AIGrowingSuggestions {
  constructor() {
    this.weatherData = null;
    this.lastWeatherUpdate = null;
  }

  // Fetch Athens weather data
  async fetchWeatherData() {
    try {
      // Using OpenWeatherMap API (free tier)
      // Note: In production, you would need to add your API key
      const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Athens,GR&appid=${API_KEY}&units=metric`
      );
      
      if (response.ok) {
        this.weatherData = await response.json();
        this.lastWeatherUpdate = new Date();
        return this.weatherData;
      } else {
        // Fallback to mock data for demo
        return this.getMockWeatherData();
      }
    } catch (error) {
      console.warn('Weather API unavailable, using mock data:', error);
      return this.getMockWeatherData();
    }
  }

  // Mock weather data for Athens
  getMockWeatherData() {
    const mockData = {
      main: {
        temp: 32,
        humidity: 45,
        feels_like: 35
      },
      weather: [{
        main: 'Clear',
        description: 'clear sky'
      }],
      wind: {
        speed: 3.2
      },
      visibility: 10000
    };
    
    this.weatherData = mockData;
    this.lastWeatherUpdate = new Date();
    return mockData;
  }

  // Get current plants data
  getCurrentPlants() {
    if (typeof window !== 'undefined' && window.AppStorage && window.AppStorage.plantProfiles) {
      return window.AppStorage.plantProfiles;
    }
    return samplePlants;
  }

  // Analyze plant for training suggestions
  analyzeTrainingNeeds(plant) {
    const suggestions = [];
    const currentDate = new Date();
    const plantAge = plant.germinationDate ? 
      Math.floor((currentDate - new Date(plant.germinationDate)) / (1000 * 60 * 60 * 24)) : 30;

    // Topping suggestions
    if (plant.internodesNumber >= 0.8 && plant.height >= 0.7 && !plant.trainingMethods.includes('topping')) {
      suggestions.push({
        type: 'training',
        priority: 'high',
        title: 'Optimal Topping Window',
        description: `Plant #${plant.strainNumber} has reached optimal height and node development for topping`,
        action: 'Top main cola above 4th-5th node',
        confidence: 0.9,
        timing: 'Next 3-7 days'
      });
    }

    // LST suggestions
    if (plant.height >= 0.6 && plant.stemRigidity >= 0.6 && !plant.trainingMethods.includes('lst')) {
      suggestions.push({
        type: 'training',
        priority: 'medium',
        title: 'LST Opportunity',
        description: `Stem flexibility and height make this ideal for Low Stress Training`,
        action: 'Begin gentle LST on main cola and side branches',
        confidence: 0.85,
        timing: 'Anytime in next 2 weeks'
      });
    }

    // Supercropping for vigorous plants
    if (plant.stemRigidity >= 0.8 && plant.sideShootActivation >= 0.8) {
      suggestions.push({
        type: 'training',
        priority: 'low',
        title: 'Supercropping Candidate',
        description: `Strong stem and vigorous growth pattern suitable for supercropping`,
        action: 'Consider supercropping tallest branches',
        confidence: 0.75,
        timing: 'Advanced technique - proceed with caution'
      });
    }

    return suggestions;
  }

  // Analyze environmental conditions
  analyzeEnvironmentalConditions() {
    const suggestions = [];
    
    if (!this.weatherData) {
      this.getMockWeatherData();
    }

    const temp = this.weatherData.main.temp;
    const humidity = this.weatherData.main.humidity;

    // Heat stress warnings
    if (temp > 35) {
      suggestions.push({
        type: 'environmental',
        priority: 'high',
        title: 'Extreme Heat Warning',
        description: `Athens temperature at ${temp}°C - immediate heat protection needed`,
        action: 'Install shade cloth (30-50%), increase watering frequency, ensure ventilation',
        confidence: 0.95,
        timing: 'Immediate action required'
      });
    } else if (temp > 30) {
      suggestions.push({
        type: 'environmental',
        priority: 'medium',
        title: 'Heat Stress Prevention',
        description: `Temperature at ${temp}°C - monitor plants for heat stress signs`,
        action: 'Consider afternoon shade, monitor soil moisture',
        confidence: 0.8,
        timing: 'Today'
      });
    }

    // Humidity concerns
    if (humidity > 70) {
      suggestions.push({
        type: 'environmental',
        priority: 'medium',
        title: 'High Humidity Alert',
        description: `Humidity at ${humidity}% - increased mold/mildew risk`,
        action: 'Improve air circulation, reduce watering frequency',
        confidence: 0.85,
        timing: 'Monitor closely'
      });
    } else if (humidity < 30) {
      suggestions.push({
        type: 'environmental',
        priority: 'low',
        title: 'Low Humidity Notice',
        description: `Humidity at ${humidity}% - plants may need more frequent watering`,
        action: 'Increase watering frequency, consider humidity domes for seedlings',
        confidence: 0.7,
        timing: 'Adjust as needed'
      });
    }

    return suggestions;
  }

  // Analyze nutrition needs based on plant metrics
  analyzeNutritionNeeds(plant) {
    const suggestions = [];

    // Leaf status analysis
    if (plant.leafStatus < 0.6) {
      suggestions.push({
        type: 'nutrition',
        priority: 'high',
        title: 'Leaf Health Concern',
        description: `Plant #${plant.strainNumber} showing poor leaf condition`,
        action: 'Check pH levels, consider nutrient deficiency (likely N, Mg, or Fe)',
        confidence: 0.8,
        timing: 'Address within 2-3 days'
      });
    }

    // Root development issues
    if (plant.rootSpaghetti < 0.5) {
      suggestions.push({
        type: 'nutrition',
        priority: 'medium',
        title: 'Root Development Support',
        description: `Weak root development detected`,
        action: 'Add mycorrhizae, reduce watering frequency, check drainage',
        confidence: 0.75,
        timing: 'Next watering cycle'
      });
    }

    // Stem rigidity issues
    if (plant.stemRigidity < 0.4) {
      suggestions.push({
        type: 'nutrition',
        priority: 'medium',
        title: 'Stem Strength Support',
        description: `Weak stem development - may need structural support`,
        action: 'Increase silica supplementation, add potassium, provide support stakes',
        confidence: 0.7,
        timing: 'Next feeding'
      });
    }

    return suggestions;
  }

  // Identify cloning opportunities
  analyzeCloneOpportunities() {
    const plants = this.getCurrentPlants();
    const suggestions = [];

    const topPerformers = plants
      .filter(plant => plant.totalMediumValue >= 0.8)
      .sort((a, b) => b.totalMediumValue - a.totalMediumValue)
      .slice(0, 3);

    topPerformers.forEach(plant => {
      if (!plant.isCandidateForCloning) {
        suggestions.push({
          type: 'cloning',
          priority: 'low',
          title: 'Elite Clone Candidate',
          description: `Plant #${plant.strainNumber} shows exceptional performance (${plant.totalMediumValue.toFixed(3)})`,
          action: 'Take 4-6 clones from lower branches before flowering',
          confidence: 0.9,
          timing: 'Before flower transition'
        });
      }
    });

    return suggestions;
  }

  // Generate comprehensive suggestions
  async generateSuggestions() {
    const plants = this.getCurrentPlants();
    let allSuggestions = [];

    // Update weather data if needed
    if (!this.weatherData || 
        (this.lastWeatherUpdate && (new Date() - this.lastWeatherUpdate) > 3600000)) {
      await this.fetchWeatherData();
    }

    // Environmental suggestions (global)
    const environmentalSuggestions = this.analyzeEnvironmentalConditions();
    allSuggestions = allSuggestions.concat(
      environmentalSuggestions.map(suggestion => ({
        ...suggestion,
        id: `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        plantId: null // Global suggestion
      }))
    );

    // Plant-specific suggestions
    plants.forEach(plant => {
      // Training suggestions
      const trainingSuggestions = this.analyzeTrainingNeeds(plant);
      allSuggestions = allSuggestions.concat(
        trainingSuggestions.map(suggestion => ({
          ...suggestion,
          id: `train_${plant.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          plantId: plant.id
        }))
      );

      // Nutrition suggestions
      const nutritionSuggestions = this.analyzeNutritionNeeds(plant);
      allSuggestions = allSuggestions.concat(
        nutritionSuggestions.map(suggestion => ({
          ...suggestion,
          id: `nutr_${plant.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          plantId: plant.id
        }))
      );
    });

    // Cloning opportunities
    const cloningSuggestions = this.analyzeCloneOpportunities();
    allSuggestions = allSuggestions.concat(
      cloningSuggestions.map(suggestion => ({
        ...suggestion,
        id: `clone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        plantId: suggestion.plantId || null
      }))
    );

    // Sort by priority and confidence
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    allSuggestions.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });

    return allSuggestions.slice(0, 10); // Return top 10 suggestions
  }

  // Get weather summary for display
  getWeatherSummary() {
    if (!this.weatherData) {
      return {
        temperature: 'N/A',
        humidity: 'N/A',
        conditions: 'Weather data unavailable',
        lastUpdate: 'Never'
      };
    }

    return {
      temperature: `${Math.round(this.weatherData.main.temp)}°C`,
      humidity: `${this.weatherData.main.humidity}%`,
      conditions: this.weatherData.weather[0].description,
      lastUpdate: this.lastWeatherUpdate ? this.lastWeatherUpdate.toLocaleTimeString() : 'Unknown'
    };
  }

  // Mediterranean growing calendar
  getSeasonalAdvice() {
    const month = new Date().getMonth() + 1; // 1-12
    const advice = [];

    switch (month) {
      case 3:
      case 4:
      case 5: // Spring
        advice.push({
          type: 'seasonal',
          priority: 'medium',
          title: 'Spring Growing Season',
          description: 'Optimal time for germination and early vegetative growth in Athens',
          action: 'Start seeds indoors, prepare outdoor growing areas, check soil pH',
          confidence: 0.9
        });
        break;
      
      case 6:
      case 7:
      case 8: // Summer
        advice.push({
          type: 'seasonal',
          priority: 'high',
          title: 'Summer Heat Management',
          description: 'Peak growing season but heat stress is major concern',
          action: 'Implement shade cloth, increase watering frequency, monitor for pests',
          confidence: 0.95
        });
        break;
      
      case 9:
      case 10: // Early Fall
        advice.push({
          type: 'seasonal',
          priority: 'medium',
          title: 'Flowering Season',
          description: 'Natural photoperiod triggers flowering in outdoor plants',
          action: 'Switch to bloom nutrients, reduce nitrogen, monitor for mold',
          confidence: 0.9
        });
        break;
      
      case 11:
      case 12:
      case 1:
      case 2: // Winter
        advice.push({
          type: 'seasonal',
          priority: 'low',
          title: 'Winter Planning',
          description: 'Off-season for outdoor growing in Athens',
          action: 'Plan next season, maintain indoor grows, prepare equipment',
          confidence: 0.8
        });
        break;
    }

    return advice;
  }
}

// Export singleton instance
export const aiSuggestions = new AIGrowingSuggestions();

