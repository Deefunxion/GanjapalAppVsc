// Tray allocation logic for spreadsheet import
export class TrayAllocator {
  static TRAY_CONFIGS = {
    'Big Tray': {
      zoneType: 'BIG_TRAY',
      layout: 'grid',
      dimensions: { rows: 2, cols: 5 },
      capacity: 10,
      positions: []
    },
    'Small Tray': {
      zoneType: 'SMALL_TRAY', 
      layout: 'grid',
      dimensions: { rows: 2, cols: 3 },
      capacity: 6,
      positions: []
    },
    'Round Pot': {
      zoneType: 'ROUND_POT',
      layout: 'circular',
      capacity: 7,
      positions: [
        { x: 0, y: 0, label: 'center' }, // Center position
        { x: 1, y: 0, label: 'perimeter' }, // Perimeter positions
        { x: 2, y: 0, label: 'perimeter' },
        { x: 3, y: 0, label: 'perimeter' },
        { x: 4, y: 0, label: 'perimeter' },
        { x: 5, y: 0, label: 'perimeter' },
        { x: 6, y: 0, label: 'perimeter' }
      ]
    },
    'Jardine': {
      zoneType: 'JARDINE',
      layout: 'planter',
      dimensions: { rows: 3, cols: 7 },
      capacity: 17, // 7 + 3 + 7 (top row + middle 3 + bottom row)
      positions: []
    }
  };

  static initializePositions() {
    // Initialize Large Tray positions (2x5 grid)
    this.TRAY_CONFIGS['Big Tray'].positions = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        this.TRAY_CONFIGS['Big Tray'].positions.push({ x: col, y: row });
      }
    }

    // Initialize Small Tray positions (2x3 grid)
    this.TRAY_CONFIGS['Small Tray'].positions = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        this.TRAY_CONFIGS['Small Tray'].positions.push({ x: col, y: row });
      }
    }

    // Initialize Jardine (ZARDINIERA) positions (4-3-4 layout)
    this.TRAY_CONFIGS.Jardine.positions = [
      // Top row (y=0): 4 slots
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
      // Middle row (y=1): 3 slots (centered at x=0,1,2)
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
      // Bottom row (y=2): 4 slots
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }
    ];
  }

  static allocatePlantsToTrays(plants, trayAllocations) {
    this.initializePositions();
    
    const allocatedPlants = [];
    const trayUsage = {};

    // Initialize tray usage tracking
    Object.keys(this.TRAY_CONFIGS).forEach(trayType => {
      trayUsage[trayType] = [];
    });

    // Process each plant
    plants.forEach((plant, index) => {
      const allocation = trayAllocations[index];
      if (!allocation || !allocation.trayType) {
        console.warn(`No tray allocation found for plant ${plant.strainNumber}`);
        return;
      }

      const trayType = allocation.trayType;
      const trayConfig = this.TRAY_CONFIGS[trayType];
      
      if (!trayConfig) {
        console.warn(`Unknown tray type: ${trayType}`);
        return;
      }

      // Find next available position in this tray type
      const usedPositions = trayUsage[trayType];
      const availablePositions = trayConfig.positions.filter(pos => 
        !usedPositions.some(used => used.x === pos.x && used.y === pos.y)
      );

      if (availablePositions.length === 0) {
        console.warn(`No available positions in ${trayType} tray for plant ${plant.strainNumber}`);
        return;
      }

      const position = availablePositions[0];
      trayUsage[trayType].push(position);

      // Create allocated plant with proper zone and position
      const allocatedPlant = {
        ...plant,
        zone: trayConfig.zoneType,
        position: position,
        trayType: trayType,
        allocationIndex: index
      };

      allocatedPlants.push(allocatedPlant);
    });

    return {
      plants: allocatedPlants,
      trayUsage: trayUsage,
      summary: this.generateAllocationSummary(trayUsage)
    };
  }

  static generateAllocationSummary(trayUsage) {
    const summary = {};
    
    Object.entries(trayUsage).forEach(([trayType, positions]) => {
      const config = this.TRAY_CONFIGS[trayType];
      summary[trayType] = {
        used: positions.length,
        capacity: config.capacity,
        available: config.capacity - positions.length,
        utilization: ((positions.length / config.capacity) * 100).toFixed(1) + '%'
      };
    });

    return summary;
  }

  static validateTrayAllocation(plants, trayAllocations) {
    const errors = [];
    const warnings = [];

    // Check if allocations array matches plants array
    if (trayAllocations.length !== plants.length) {
      errors.push(`Mismatch: ${plants.length} plants but ${trayAllocations.length} allocations`);
    }

    // Count plants per tray type
    const trayTypeCounts = {};
    trayAllocations.forEach(allocation => {
      if (allocation.trayType) {
        trayTypeCounts[allocation.trayType] = (trayTypeCounts[allocation.trayType] || 0) + 1;
      }
    });

    // Check capacity limits
    Object.entries(trayTypeCounts).forEach(([trayType, count]) => {
      const config = this.TRAY_CONFIGS[trayType];
      if (config && count > config.capacity) {
        errors.push(`${trayType} tray capacity exceeded: ${count}/${config.capacity} plants`);
      }
    });

    // Check for missing allocations
    trayAllocations.forEach((allocation, index) => {
      if (!allocation.trayType) {
        warnings.push(`Plant ${plants[index]?.strainNumber || index + 1} has no tray allocation`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      trayTypeCounts: trayTypeCounts
    };
  }

  static getOptimalTrayAllocation(plants) {
    // Simple algorithm to suggest optimal tray allocation
    const suggestions = [];
    let largeCount = 0;
    let smallCount = 0;
    let roundCount = 0;
    let planterCount = 0;

    plants.forEach((plant, index) => {
      let suggestedTray = 'Large'; // Default

      // Allocation logic based on plant characteristics
      if (plant.isKeeperPheno || plant.isCandidateForCloning) {
        // Premium plants get priority placement
        if (roundCount < this.TRAY_CONFIGS.Round.capacity) {
          suggestedTray = 'Round';
          roundCount++;
        } else if (planterCount < this.TRAY_CONFIGS.Planter.capacity) {
          suggestedTray = 'Planter';
          planterCount++;
        } else if (largeCount < this.TRAY_CONFIGS.Large.capacity) {
          suggestedTray = 'Large';
          largeCount++;
        } else if (smallCount < this.TRAY_CONFIGS.Small.capacity) {
          suggestedTray = 'Small';
          smallCount++;
        }
      } else {
        // Regular plants
        if (largeCount < this.TRAY_CONFIGS.Large.capacity) {
          suggestedTray = 'Large';
          largeCount++;
        } else if (smallCount < this.TRAY_CONFIGS.Small.capacity) {
          suggestedTray = 'Small';
          smallCount++;
        } else if (planterCount < this.TRAY_CONFIGS.Planter.capacity) {
          suggestedTray = 'Planter';
          planterCount++;
        } else if (roundCount < this.TRAY_CONFIGS.Round.capacity) {
          suggestedTray = 'Round';
          roundCount++;
        }
      }

      suggestions.push({
        plantIndex: index,
        plantNumber: plant.strainNumber,
        suggestedTray: suggestedTray,
        reason: plant.isKeeperPheno ? 'Keeper phenotype' : 
                plant.isCandidateForCloning ? 'Clone candidate' : 'Standard allocation'
      });
    });

    return suggestions;
  }
}

// Export for use in DataManagement component
export default TrayAllocator;

