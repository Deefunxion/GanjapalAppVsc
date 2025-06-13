import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Target,
  Leaf,
  Scissors,
  Star
} from 'lucide-react';
import { samplePlants, getScoreColor, ZONE_TYPES, zoneConfigs } from '../data/plantData';
import AppStorage from '../utils/storage';

const Analytics = () => {
  const [plants, setPlants] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load plants and set up refresh mechanism
  useEffect(() => {
    const loadPlants = () => {
      const storedPlants = AppStorage.getPlantProfiles();
      if (storedPlants.length > 0) {
        setPlants(storedPlants);
      } else {
        setPlants(samplePlants);
      }
    };

    loadPlants();

    // Listen for storage changes to update analytics dynamically
    const handleStorageChange = () => {
      loadPlants();
      setRefreshKey(prev => prev + 1);
    };

    // Listen for custom events from import operations
    window.addEventListener('plantsUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('plantsUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshKey]);

  // Prepare data for charts
  const strainPerformanceData = plants.map(plant => ({
    strain: plant.strainType.substring(0, 15) + '...',
    score: plant.totalMediumValue,
    height: plant.height,
    symmetry: plant.symmetry,
    leafStatus: plant.leafStatus,
    internodes: plant.internodesNumber,
    spacing: plant.internodesSpacing,
    width: plant.width,
    rootSpaghetti: plant.rootSpaghetti,
    stemRigidity: plant.stemRigidity,
    sideShootActivation: plant.sideShootActivation,
    strainNumber: plant.strainNumber
  }));

  // Top performers
  const topPerformers = [...plants]
    .sort((a, b) => b.totalMediumValue - a.totalMediumValue)
    .slice(0, 5);

  // Keeper phenotypes
  const keeperPhenos = plants.filter(plant => plant.isKeeperPheno);
  const cloneCandidates = plants.filter(plant => plant.isCandidateForCloning);

  // Performance metrics
  const avgScore = plants.length > 0 ? (plants.reduce((sum, plant) => sum + plant.totalMediumValue, 0) / plants.length).toFixed(3) : '0.000';
  const highPerformers = plants.filter(plant => plant.totalMediumValue >= 0.8).length;
  const lowPerformers = plants.filter(plant => plant.totalMediumValue < 0.6).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {plants.length} plants analyzed • Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{avgScore}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold text-blue-600">{highPerformers}</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Keeper Phenos</p>
                <p className="text-2xl font-bold text-purple-600">{keeperPhenos.length}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clone Candidates</p>
                <p className="text-2xl font-bold text-orange-600">{cloneCandidates.length}</p>
              </div>
              <Scissors className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strain Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strain Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={strainPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="strainNumber" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Strain Number', position: 'insideBottom', offset: -5 }}
                />
                <YAxis domain={[0, 1]} label={{ value: 'Total Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [value.toFixed(3), 'Total Score']}
                  labelFormatter={(label) => `Plant #${label}`}
                />
                <Bar dataKey="score" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Performing Plants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topPerformers.map((plant, index) => (
              <div key={plant.id} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold">#{plant.strainNumber}</span>
                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">{plant.strainType}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    {plant.totalMediumValue.toFixed(3)}
                  </span>
                  <div className="flex gap-1">
                    {plant.isKeeperPheno && <Star className="w-3 h-3 text-yellow-500" />}
                    {plant.isCandidateForCloning && <Scissors className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

