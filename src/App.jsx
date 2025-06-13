import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  BarChart3, 
  Calendar,
  Database,
  Settings,
  Menu
} from 'lucide-react';
import GrowDeck from './components/GrowDeck';
import PlantProfile from './components/PlantProfile';
import Analytics from './components/Analytics';
import Timeline from './components/Timeline';
import DataManagement from './components/DataManagement';
import AppStorage from './utils/storage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('deck');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load plants from storage
        const storedPlants = AppStorage.getPlantProfiles();
        setPlants(storedPlants);
        
        // Initialize storage if empty
        if (storedPlants.length === 0) {
          console.log('No stored plants found, using sample data');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Listen for storage changes (for cross-component updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedPlants = AppStorage.getPlantProfiles();
      setPlants(updatedPlants);
    };

    // Listen for custom storage events
    window.addEventListener('ganjapal-storage-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('ganjapal-storage-update', handleStorageChange);
    };
  }, []);

  const handlePlantUpdate = (updatedPlant) => {
    // Update plant in storage
    AppStorage.updatePlantProfile(updatedPlant);
    
    // Update local state
    setPlants(prev => prev.map(p => p.id === updatedPlant.id ? updatedPlant : p));
    setSelectedPlant(updatedPlant);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('ganjapal-storage-update'));
  };

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
  };

  const handlePlantClose = () => {
    setSelectedPlant(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Loading Grow Automation Assistant</h2>
          <p className="text-muted-foreground">Initializing your cannabis cultivation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold">Grow Automation Assistant</h1>
                <p className="text-sm text-muted-foreground">Mediterranean Cannabis Cultivation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>{plants.length} plants tracked</span>
                <span>•</span>
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <Button variant="outline" size="sm" className="md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="border-b bg-card sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="deck" className="flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                <span className="hidden sm:inline">Grow Deck</span>
                <span className="sm:hidden">Deck</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Timeline</span>
                <span className="sm:hidden">Events</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Data</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="deck" className="mt-0">
            <GrowDeck 
              plants={plants}
              onPlantSelect={handlePlantSelect}
              selectedPlant={selectedPlant}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <Analytics plants={plants} />
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-0">
            <Timeline plants={plants} />
          </TabsContent>
          
          <TabsContent value="data" className="mt-0">
            <DataManagement plants={plants} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Plant Profile Modal */}
      {selectedPlant && (
        <PlantProfile
          plant={selectedPlant}
          onUpdate={handlePlantUpdate}
          onClose={handlePlantClose}
          isOpen={!!selectedPlant}
        />
      )}
    </div>
  );
}

export default App;

