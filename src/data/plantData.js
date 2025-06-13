// Plant data types and interfaces
export const ZONE_TYPES = {
  BIG_TRAY: 'BIG_TRAY',
  JARDINE: 'JARDINE',
  SMALL_TRAY: 'SMALL_TRAY',
  ROUND_POT: 'ROUND_POT'
};

export const TRAINING_METHODS = {
  TOPPING: 'topping',
  FIMMING: 'fimming',
  LST: 'lst',
  SUPERCROPPING: 'supercropping'
};

export const PLANT_STATUS = {
  SEEDLING: 'seedling',
  VEGETATIVE: 'vegetative',
  FLOWERING: 'flowering',
  HARVEST: 'harvest'
};

// Sample plant data based on user's Excel file
export const samplePlants = [
  {
    id: '1',
    strainNumber: 1,
    strainType: 'Super Silver Haze xa',
    zone: ZONE_TYPES.BIG_TRAY,
    position: { x: 0, y: 0 },
    leafStatus: 0.8,
    internodesNumber: 0.9,
    internodesSpacing: 0.7,
    height: 0.8,
    width: 0.70,
    rootSpaghetti: 0.85,
    stemRigidity: 0.5,
    sideShootActivation: 0.60,
    symmetry: 0.65,
    totalMediumValue: 0.722222,
    trainingMethods: [TRAINING_METHODS.TOPPING],
    trainingHistory: [],
    isAutoflower: false,
    isKeeperPheno: false,
    isCandidateForCloning: true,
    clonesTaken: [],
    photos: [],
    notes: [],
    germinationDate: new Date('2024-05-01'),
    lastUpdated: new Date()
  },
  {
    id: '2',
    strainNumber: 2,
    strainType: 'MirMix or Sher',
    zone: ZONE_TYPES.BIG_TRAY,
    position: { x: 1, y: 0 },
    leafStatus: 0.7,
    internodesNumber: 0.9,
    internodesSpacing: 0.9,
    height: 0.9,
    width: 0.80,
    rootSpaghetti: 0.60,
    stemRigidity: 0.7,
    sideShootActivation: 0.90,
    symmetry: 0.85,
    totalMediumValue: 0.805556,
    trainingMethods: [TRAINING_METHODS.LST],
    trainingHistory: [],
    isAutoflower: false,
    isKeeperPheno: true,
    isCandidateForCloning: true,
    clonesTaken: [],
    photos: [],
    notes: [],
    germinationDate: new Date('2024-05-01'),
    lastUpdated: new Date()
  },
  {
    id: '3',
    strainNumber: 3,
    strainType: 'Mirko Nice #2',
    zone: ZONE_TYPES.ROUND_POT,
    position: { x: 1, y: 0 },
    leafStatus: 0.8,
    internodesNumber: 0.8,
    internodesSpacing: 0.9,
    height: 0.75,
    width: 0.80,
    rootSpaghetti: 0.60,
    stemRigidity: 0.7,
    sideShootActivation: 0.75,
    symmetry: 0.85,
    totalMediumValue: 0.772222,
    trainingMethods: [TRAINING_METHODS.FIMMING],
    trainingHistory: [],
    isAutoflower: false,
    isKeeperPheno: false,
    isCandidateForCloning: false,
    clonesTaken: [],
    photos: [],
    notes: [],
    germinationDate: new Date('2024-05-01'),
    lastUpdated: new Date()
  },
  {
    id: '13',
    strainNumber: 13,
    strainType: 'OTI Rs',
    zone: ZONE_TYPES.BIG_TRAY,
    position: { x: 0, y: 1 },
    leafStatus: 0.9,
    internodesNumber: 0.8,
    internodesSpacing: 0.8,
    height: 0.85,
    width: 0.85,
    rootSpaghetti: 0.95,
    stemRigidity: 0.5,
    sideShootActivation: 0.75,
    symmetry: 0.90,
    totalMediumValue: 0.811111,
    trainingMethods: [TRAINING_METHODS.TOPPING, TRAINING_METHODS.LST],
    trainingHistory: [],
    isAutoflower: false,
    isKeeperPheno: true,
    isCandidateForCloning: true,
    clonesTaken: [],
    photos: [],
    notes: [],
    germinationDate: new Date('2024-05-01'),
    lastUpdated: new Date()
  },
  {
    id: '16',
    strainNumber: 16,
    strainType: 'Money Maker Xb Rs',
    zone: ZONE_TYPES.JARDINE,
    position: { x: 0, y: 0 },
    leafStatus: 0.8,
    internodesNumber: 0.8,
    internodesSpacing: 0.75,
    height: 0.8,
    width: 0.80,
    rootSpaghetti: 0.95,
    stemRigidity: 0.5,
    sideShootActivation: 0.75,
    symmetry: 0.75,
    totalMediumValue: 0.766667,
    trainingMethods: [TRAINING_METHODS.SUPERCROPPING],
    trainingHistory: [],
    isAutoflower: false,
    isKeeperPheno: false,
    isCandidateForCloning: false,
    clonesTaken: [],
    photos: [],
    notes: [],
    germinationDate: new Date('2024-05-01'),
    lastUpdated: new Date()
  },
  {
    id: '25',
    strainNumber: 25,
    strainType: 'OTI xb',
    zone: ZONE_TYPES.SMALL_TRAY,
    position: { x: 0, y: 0 },
    leafStatus: 0.8,
    internodesNumber: 0.85,
    internodesSpacing: 0.9,
    height: 0.8,
    width: 0.85,
    rootSpaghetti: 0.80,
    stemRigidity: 0.5,
    sideShootActivation: 0.95,
    symmetry: 0.95,
    totalMediumValue: 0.822222,
    trainingMethods: [TRAINING_METHODS.TOPPING],
     trainingHistory: [],
    isAutoflower: false,
    isKeeperPheno: true,
    isCandidateForCloning: true,
    clonesTaken: [],
    photos: [],
    notes: [],
    germinationDate: new Date('2024-05-01'),
    lastUpdated: new Date()
  }
];

// Zone configurations matching user's hand-drawn layout
export const zoneConfigs = {
  [ZONE_TYPES.BIG_TRAY]: {
    name: 'Big Tray',
    layout: 'grid',
    gridSize: { rows: 2, cols: 5 },
    capacity: 10,
    color: 'zone-big-tray'
  },
  [ZONE_TYPES.JARDINE]: {
    name: 'Jardine',
    layout: 'planter',
    gridSize: { rows: 3, cols: 4 },
    rowLayout: [4, 3, 4],
    capacity: 11,
    color: 'zone-jardine'
  },
  [ZONE_TYPES.SMALL_TRAY]: {
    name: 'Small Tray',
    layout: 'grid',
    gridSize: { rows: 2, cols: 3 },
    capacity: 6,
    color: 'zone-small-tray'
  },
  [ZONE_TYPES.ROUND_POT]: {
    name: 'Round Pot',
    layout: 'large-round',
    capacity: 7,
    color: 'zone-round-pot'
  }
};

// Helper functions
export const getScoreColor = (score) => {
  if (score >= 0.8) return 'phenotype-excellent';
  if (score >= 0.7) return 'phenotype-good';
  if (score >= 0.6) return 'phenotype-average';
  return 'phenotype-poor';
};

export const getTrainingBadgeClass = (method) => {
  const baseClass = 'training-badge ';
  switch (method) {
    case TRAINING_METHODS.TOPPING:
      return baseClass + 'training-topping';
    case TRAINING_METHODS.FIMMING:
      return baseClass + 'training-fimming';
    case TRAINING_METHODS.LST:
      return baseClass + 'training-lst';
    case TRAINING_METHODS.SUPERCROPPING:
      return baseClass + 'training-supercropping';
    default:
      return baseClass;
  }
};

