import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Leaf, 
  MapPin, 
  Plus,
  Filter,
  Search,
  Settings,
  Trash2
} from 'lucide-react';
import { samplePlants, zoneConfigs, ZONE_TYPES, getScoreColor, getTrainingBadgeClass } from '../data/plantData';
import AppStorage from '../utils/storage';

const PlantItem = ({ plant, onSelect, onDelete, isSelected }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete plant #${plant.strainNumber}?`)) {
      onDelete(plant.id);
    }
  };

  return (
    <div 
      className={`plant-item cursor-pointer p-3 border rounded-lg transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-green-500 bg-green-50' : 'bg-white hover:bg-gray-50'
      }`}
      onClick={() => onSelect(plant)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm font-semibold">#{plant.strainNumber}</span>
        <div className="flex gap-1 items-center">
          {plant.isKeeperPheno && (
            <Badge variant="secondary" className="text-xs">⭐</Badge>
          )}
          {plant.isCandidateForCloning && (
            <Badge variant="outline" className="text-xs">🧬</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mb-1 truncate">
        {plant.strainType}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium text-green-600`}>
          {/* Label changed to 'Total Score' */}
          Total Score: {plant.totalMediumValue?.toFixed(2) || '0.00'}
        </span>
        <div className="flex gap-1">
          {plant.trainingMethods?.map((method, idx) => (
            <span key={idx} className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-800">
              {method.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const AddPlantDialog = ({ onAddPlant, isOpen, onClose }) => {
  const [newPlant, setNewPlant] = useState({
    strainNumber: '',
    strainType: '',
    zone: ZONE_TYPES.BIG_TRAY
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPlant.strainNumber || !newPlant.strainType) return;

    const plant = {
      id: Date.now().toString(),
      strainNumber: parseInt(newPlant.strainNumber),
      strainType: newPlant.strainType,
      zone: newPlant.zone,
      position: { x: 0, y: 0 },
      leafStatus: 0.5,
      internodesNumber: 0.5,
      internodesSpacing: 0.5,
      height: 0.5,
      width: 0.5,
      rootSpaghetti: 0.5,
      stemRigidity: 0.5,
      sideShootActivation: 0.5,
      symmetry: 0.5,
      totalMediumValue: 0.5,
      trainingMethods: [],
      trainingHistory: [],
      isAutoflower: false,
      isKeeperPheno: false,
      isCandidateForCloning: false,
      clonesTaken: [],
      photos: [],
      notes: [],
      germinationDate: new Date(),
      lastUpdated: new Date()
    };

    onAddPlant(plant);
    setNewPlant({ strainNumber: '', strainType: '', zone: ZONE_TYPES.BIG_TRAY });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Strain Number</label>
            <Input
              type="number"
              value={newPlant.strainNumber}
              onChange={(e) => setNewPlant(prev => ({ ...prev, strainNumber: e.target.value }))}
              placeholder="Enter strain number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Strain Type</label>
            <Input
              value={newPlant.strainType}
              onChange={(e) => setNewPlant(prev => ({ ...prev, strainType: e.target.value }))}
              placeholder="Enter strain type"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Zone</label>
            <select
              value={newPlant.zone}
              onChange={(e) => setNewPlant(prev => ({ ...prev, zone: e.target.value }))}
              className="w-full p-2 border rounded-md"
            >
              {Object.entries(zoneConfigs).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Add Plant</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ZoneGrid = ({ zone, plants, onPlantSelect, onPlantDelete, selectedPlant }) => {
  // Add console.log for debugging zone and rowLayout in ZoneGrid
  const config = zoneConfigs[zone];
  if (!config) return null;
  
  const zonePlants = plants.filter(p => p.zone === zone);
  if (config.layout === 'planter') {
    const rowLayout = config.rowLayout || [4, 4, 4];
    console.log('Rendering zone:', zone, 'rowLayout:', rowLayout);
    const totalSlots = rowLayout.reduce((sum, n) => sum + n, 0);
    const slots = Array(totalSlots).fill(null);
    zonePlants.forEach((plant, i) => {
      if (i < totalSlots) {
        slots[i] = plant;
      }
    });
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {config.name}
            <Badge variant="outline" className="ml-auto">
              {zonePlants.length}/{config.capacity}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {rowLayout.map((count, rowIdx) => {
              const start = rowLayout.slice(0, rowIdx).reduce((a, b) => a + b, 0);
              return (
                <div className="flex gap-2" key={rowIdx}>
                  {Array.from({ length: count }).map((_, i) => {
                    const idx = start + i;
                    return (
                      <div key={idx} className="flex-1 min-w-0">
                        {slots[idx] ? (
                          <PlantItem
                            plant={slots[idx]}
                            onSelect={onPlantSelect}
                            onDelete={onPlantDelete}
                            isSelected={selectedPlant?.id === slots[idx].id}
                          />
                        ) : (
                          <div className="aspect-square min-h-[80px] w-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-gray-300 transition-colors">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {/* Per-Tray Analytics Summary */}
          {zonePlants.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Avg Total Score</p>
                  <p className="font-semibold text-green-600">
                    {(zonePlants.reduce((sum, p) => sum + p.totalMediumValue, 0) / zonePlants.length).toFixed(3)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Keepers</p>
                  <p className="font-semibold text-purple-600">
                    {zonePlants.filter(p => p.isKeeperPheno).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Clone Ready</p>
                  <p className="font-semibold text-blue-600">
                    {zonePlants.filter(p => p.isCandidateForCloning).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  if (config.layout === 'circular' || config.layout === 'large-round') {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {config.name}
            <Badge variant="outline" className="ml-auto">
              {zonePlants.length}/{config.capacity}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-64 h-64 mx-auto">
            {/* Center position */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16">
              {zonePlants.find(p => p.position.x === 0 && p.position.y === 0) ? (
                <PlantItem 
                  plant={zonePlants.find(p => p.position.x === 0 && p.position.y === 0)} 
                  onSelect={onPlantSelect}
                  onDelete={onPlantDelete}
                  isSelected={selectedPlant?.id === zonePlants.find(p => p.position.x === 0 && p.position.y === 0)?.id}
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Perimeter positions */}
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i * 60) * (Math.PI / 180);
              const radius = 80;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const plant = zonePlants.find(p => p.position.x === i + 1);
              
              return (
                <div
                  key={i}
                  className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`
                  }}
                >
                  {plant ? (
                    <PlantItem 
                      plant={plant} 
                      onSelect={onPlantSelect}
                      onDelete={onPlantDelete}
                      isSelected={selectedPlant?.id === plant.id}
                    />
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Per-Tray Analytics Summary */}
          {zonePlants.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Avg Total Score</p>
                <p className="font-semibold text-green-600">
                    {(zonePlants.reduce((sum, p) => sum + p.totalMediumValue, 0) / zonePlants.length).toFixed(3)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Keepers</p>
                  <p className="font-semibold text-purple-600">
                    {zonePlants.filter(p => p.isKeeperPheno).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Clone Ready</p>
                  <p className="font-semibold text-blue-600">
                    {zonePlants.filter(p => p.isCandidateForCloning).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (config.layout === 'planter') {
    const rowLayout = config.rowLayout || [4, 4, 4];
    const totalSlots = rowLayout.reduce((sum, n) => sum + n, 0);
    const slots = Array(totalSlots).fill(null);
    zonePlants.forEach((plant, i) => {
      if (i < totalSlots) {
        slots[i] = plant;
      }
    });
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {config.name}
            <Badge variant="outline" className="ml-auto">
              {zonePlants.length}/{config.capacity}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {rowLayout.map((count, rowIdx) => {
              const start = rowLayout.slice(0, rowIdx).reduce((a, b) => a + b, 0);
              return (
                <div className="flex gap-2" key={rowIdx}>
                  {Array.from({ length: count }).map((_, i) => {
                    const idx = start + i;
                    return (
                      <div key={idx} className="flex-1 min-w-0">
                        {slots[idx] ? (
                          <PlantItem
                            plant={slots[idx]}
                            onSelect={onPlantSelect}
                            onDelete={onPlantDelete}
                            isSelected={selectedPlant?.id === slots[idx].id}
                          />
                        ) : (
                          <div className="aspect-square min-h-[80px] w-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-gray-300 transition-colors">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {/* Per-Tray Analytics Summary */}
          {zonePlants.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Avg Total Score</p>
                  <p className="font-semibold text-green-600">
                    {(zonePlants.reduce((sum, p) => sum + p.totalMediumValue, 0) / zonePlants.length).toFixed(3)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Keepers</p>
                  <p className="font-semibold text-purple-600">
                    {zonePlants.filter(p => p.isKeeperPheno).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Clone Ready</p>
                  <p className="font-semibold text-blue-600">
                    {zonePlants.filter(p => p.isCandidateForCloning).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
};

const GrowDeck = () => {
  const [plants, setPlants] = useState(samplePlants);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeZone, setActiveZone] = useState('all');

  useEffect(() => {
    const storedPlants = AppStorage.getPlantProfiles();
    if (storedPlants) {
      setPlants(storedPlants);
    }
  }, []);

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
  };

  const handlePlantDelete = (plantId) => {
    const updatedPlants = plants.filter(p => p.id !== plantId);
    setPlants(updatedPlants);
    AppStorage.savePlantProfiles(updatedPlants);
    if (selectedPlant?.id === plantId) {
      setSelectedPlant(null);
    }
  };

  const handleAddPlant = (newPlant) => {
    const updatedPlants = [...plants, newPlant];
    setPlants(updatedPlants);
    AppStorage.savePlantProfiles(updatedPlants);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all plant data? This cannot be undone.')) {
      AppStorage.clearAllData();
      setPlants([]);
      setSelectedPlant(null);
    }
  };

  // Fix filteredPlants logic to include all plants when 'all' is selected
  const filteredPlants = plants.filter(plant => {
    const matchesZone = activeZone === 'all' ? true : plant.zone === activeZone;
    const matchesSearch = plant.strainType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.strainNumber.toString().includes(searchTerm);
    return matchesZone && matchesSearch;
  });

  const zonesToShow = activeZone === 'all'
    ? Object.values(ZONE_TYPES)
    : [activeZone];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Leaf className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Grow Deck</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Plant
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Zone Tabs */}
      <Tabs value={activeZone} onValueChange={setActiveZone}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Zones</TabsTrigger>
          <TabsTrigger value={ZONE_TYPES.BIG_TRAY}>Big Tray</TabsTrigger>
          <TabsTrigger value={ZONE_TYPES.JARDINE}>Jardine</TabsTrigger>
          <TabsTrigger value={ZONE_TYPES.SMALL_TRAY}>Small Tray</TabsTrigger>
          <TabsTrigger value={ZONE_TYPES.ROUND_POT}>Round Pot</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Zone Grids */}
      <div className={`grid gap-6 ${activeZone === 'all' ? 'grid-cols-1 lg:grid-cols-2' : ''}`}>
        {zonesToShow.map(zone => (
          <ZoneGrid
            key={zone}
            zone={zone}
            plants={filteredPlants}
            onPlantSelect={handlePlantSelect}
            onPlantDelete={handlePlantDelete}
            selectedPlant={selectedPlant}
          />
        ))}
      </div>

      {/* Add Plant Dialog */}
      <AddPlantDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAddPlant={handleAddPlant}
      />

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grow Deck Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Clear All Data</h3>
                <p className="text-sm text-muted-foreground">Remove all plants and reset the application</p>
              </div>
              <Button variant="destructive" onClick={handleClearAllData}>
                Clear Data
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download your plant data as JSON</p>
              </div>
              <Button variant="outline" onClick={() => {
                const data = AppStorage.exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ganjapal-data.json';
                a.click();
                URL.revokeObjectURL(url);
              }}>
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GrowDeck;

