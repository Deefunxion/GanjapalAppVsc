import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload,
  Download,
  FileSpreadsheet,
  Database,
  AlertCircle,
  CheckCircle,
  Settings,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AppStorage from '../utils/storage';
import TrayAllocator from '../utils/trayAllocator';
import { ZONE_TYPES } from '../data/plantData';

const ImportPreview = ({ data, onConfirm, onCancel, onTrayAllocationChange }) => {
  const [trayAllocations, setTrayAllocations] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [showOptimalSuggestion, setShowOptimalSuggestion] = useState(false);

  useEffect(() => {
    // Initialize with optimal suggestions
    const suggestions = TrayAllocator.getOptimalTrayAllocation(data);
    const initialAllocations = suggestions.map(suggestion => ({
      trayType: suggestion.suggestedTray,
      reason: suggestion.reason
    }));
    setTrayAllocations(initialAllocations);
    
    // Validate initial allocation
    const validation = TrayAllocator.validateTrayAllocation(data, initialAllocations);
    setValidationResult(validation);
  }, [data]);

  const handleTrayTypeChange = (index, newTrayType) => {
    const newAllocations = [...trayAllocations];
    newAllocations[index] = { ...newAllocations[index], trayType: newTrayType };
    setTrayAllocations(newAllocations);
    
    // Re-validate
    const validation = TrayAllocator.validateTrayAllocation(data, newAllocations);
    setValidationResult(validation);
    
    onTrayAllocationChange(newAllocations);
  };

  const applyOptimalSuggestions = () => {
    const suggestions = TrayAllocator.getOptimalTrayAllocation(data);
    const optimalAllocations = suggestions.map(suggestion => ({
      trayType: suggestion.suggestedTray,
      reason: suggestion.reason
    }));
    setTrayAllocations(optimalAllocations);
    
    const validation = TrayAllocator.validateTrayAllocation(data, optimalAllocations);
    setValidationResult(validation);
    
    onTrayAllocationChange(optimalAllocations);
  };

  const handleConfirm = () => {
    if (validationResult?.isValid) {
      const allocationResult = TrayAllocator.allocatePlantsToTrays(data, trayAllocations);
      onConfirm(allocationResult.plants, allocationResult.summary);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Preview & Tray Allocation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Validation Status */}
          {validationResult && (
            <Alert className={validationResult.isValid ? 'border-green-500' : 'border-red-500'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationResult.isValid ? (
                  <span className="text-green-700">✓ Allocation is valid and ready for import</span>
                ) : (
                  <div>
                    <span className="text-red-700">⚠ Allocation issues found:</span>
                    <ul className="mt-1 ml-4 list-disc">
                      {validationResult.errors.map((error, idx) => (
                        <li key={idx} className="text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResult.warnings.length > 0 && (
                  <div className="mt-2">
                    <span className="text-yellow-700">Warnings:</span>
                    <ul className="mt-1 ml-4 list-disc">
                      {validationResult.warnings.map((warning, idx) => (
                        <li key={idx} className="text-yellow-600">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Tray Capacity Summary */}
          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tray Capacity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(validationResult.trayTypeCounts || {}).map(([trayType, count]) => {
                    const config = TrayAllocator.TRAY_CONFIGS[trayType];
                    const isOverCapacity = count > config.capacity;
                    return (
                      <div key={trayType} className={`p-3 border rounded ${isOverCapacity ? 'border-red-300' : 'border-green-300 bg-green-50'}`}>
                        <div className="font-medium">{trayType}</div>
                        <div className={`text-sm ${isOverCapacity ? 'text-red-600' : 'text-green-600'}`}>
                          {count}/{config.capacity} plants
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimal Suggestion Button */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={applyOptimalSuggestions}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Apply Optimal Allocation
            </Button>
            <Button variant="outline" onClick={() => setShowOptimalSuggestion(!showOptimalSuggestion)}>
              <Eye className="w-4 h-4 mr-2" />
              {showOptimalSuggestion ? 'Hide' : 'Show'} Suggestions
            </Button>
          </div>

          {/* Plant List with Tray Allocation */}
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium">Plants to Import ({data.length})</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {data.map((plant, index) => (
                <div key={index} className="p-3 border-b last:border-b-0 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">#{plant.strainNumber} - {plant.strainType}</div>
                    <div className="text-sm text-gray-600">
                      Score: {plant.totalMediumValue?.toFixed(2) || 'N/A'}
                      {plant.isKeeperPheno && <Badge className="ml-2" variant="secondary">⭐ Keeper</Badge>}
                      {plant.isCandidateForCloning && <Badge className="ml-2" variant="outline">🧬 Clone</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={trayAllocations[index]?.trayType || ''}
                      onChange={(e) => handleTrayTypeChange(index, e.target.value)}
                      className="p-2 border rounded text-sm"
                    >
                      <option value="">Select Tray</option>
                      <option value="Large">Large Tray (2×5)</option>
                      <option value="Small">Small Tray (2×3)</option>
                      <option value="Round">Round Tray (6+1)</option>
                      <option value="Planter">Planter (3×7)</option>
                    </select>
                    {showOptimalSuggestion && (
                      <div className="text-xs text-gray-500 max-w-24">
                        Suggested: {TrayAllocator.getOptimalTrayAllocation([plant])[0]?.suggestedTray}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleConfirm} 
              disabled={!validationResult?.isValid}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Import {data.length} Plants
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DataManagement = () => {
  const [importData, setImportData] = useState(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [trayAllocations, setTrayAllocations] = useState([]);
  const [importStatus, setImportStatus] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let parsedData = [];
        
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parse Excel file
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Convert Excel data to plant format
          parsedData = jsonData.map((row, index) => validatePlantDefaults({
            id: `import_${Date.now()}_${index}`,
            strainNumber: row['Strain Number'] || row['strainNumber'] || index + 1,
            strainType: row['Strain Type'] || row['strainType'] || `Imported Strain ${index + 1}`,
            leafStatus: parseFloat(row['Leaf Status'] || row['leafStatus'] || 0.5),
            internodesNumber: parseFloat(row['Internodes Number'] || row['internodesNumber'] || 0.5),
            internodesSpacing: parseFloat(row['Internodes Spacing'] || row['internodesSpacing'] || 0.5),
            height: parseFloat(row['Height'] || row['height'] || 0.5),
            width: parseFloat(row['Width'] || row['width'] || 0.5),
            rootSpaghetti: parseFloat(row['Root Spaghetti'] || row['rootSpaghetti'] || 0.5),
            stemRigidity: parseFloat(row['Stem Rigidity'] || row['stemRigidity'] || 0.5),
            sideShootActivation: parseFloat(row['Side Shoot Activation'] || row['sideShootActivation'] || 0.5),
            symmetry: parseFloat(row['Symmetry'] || row['symmetry'] || 0.5),
            totalMediumValue: parseFloat(row['Total Score'] || row['Total Medium Value'] || row['totalMediumValue'] || 0.5),
            trainingMethods: [],
            trainingHistory: [],
            isAutoflower: Boolean(row['Is Autoflower'] || row['isAutoflower']),
            isKeeperPheno: Boolean(row['Is Keeper Pheno'] || row['isKeeperPheno']),
            isCandidateForCloning: Boolean(row['Is Candidate For Cloning'] || row['isCandidateForCloning']),
            clonesTaken: [],
            photos: [],
            notes: [],
            germinationDate: new Date(),
            lastUpdated: new Date()
          }));
        } else if (file.name.endsWith('.json')) {
          // Parse JSON file
          parsedData = JSON.parse(e.target.result);
          if (parsedData.plantProfiles) {
            parsedData = parsedData.plantProfiles;
          }
        } else if (file.name.endsWith('.csv')) {
          // Parse CSV file
          const lines = e.target.result.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          parsedData = lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            const plant = { id: `import_${Date.now()}_${index}` };
            
            headers.forEach((header, i) => {
              const value = values[i] || '';
              switch (header.toLowerCase()) {
                case 'strain number':
                case 'strainnumber':
                  plant.strainNumber = parseInt(value) || index + 1;
                  break;
                case 'strain type':
                case 'straintype':
                  plant.strainType = value || `Imported Strain ${index + 1}`;
                  break;
                default:
                  if (header.includes('Status') || header.includes('Number') || header.includes('Value')) {
                    plant[header] = parseFloat(value) || 0.5;
                  } else {
                    plant[header] = value;
                  }
              }
            });
            
            // Set defaults for missing fields
            plant.totalMediumValue = plant.totalMediumValue || 0.5;
            plant.trainingMethods = [];
            plant.germinationDate = new Date();
            plant.lastUpdated = new Date();
            
            return plant;
          });
        }

        if (parsedData.length > 0) {
          setImportData(parsedData);
          setShowImportPreview(true);
          setImportStatus({ type: 'info', message: `Loaded ${parsedData.length} plants for preview` });
        } else {
          setImportStatus({ type: 'error', message: 'No valid plant data found in file' });
        }
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus({ type: 'error', message: `Import failed: ${error.message}` });
      }
    };

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleImportConfirm = (allocatedPlants, allocationSummary) => {
    try {
      // Get existing plants
      const existingPlants = AppStorage.getPlantProfiles();
      
      // Merge with new plants
      const mergedPlants = [...existingPlants, ...allocatedPlants];
      
      // Save to storage
      AppStorage.savePlantProfiles(mergedPlants);
      
      // Dispatch custom event to notify Analytics and other components
      window.dispatchEvent(new CustomEvent('plantsUpdated', { 
        detail: { plants: mergedPlants, source: 'import' } 
      }));
      
      setImportStatus({ 
        type: 'success', 
        message: `Successfully imported ${allocatedPlants.length} plants with tray allocation` 
      });
      setShowImportPreview(false);
      setImportData(null);
      
      // No need to reload page anymore - components will update via event
    } catch (error) {
      console.error('Import confirmation error:', error);
      setImportStatus({ type: 'error', message: `Import failed: ${error.message}` });
    }
  };

  const handleExport = () => {
    try {
      const data = AppStorage.exportData();
      
      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ganjapal-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'csv') {
        const plants = data.plantProfiles;
        if (plants.length === 0) {
          setImportStatus({ type: 'warning', message: 'No plants to export' });
          return;
        }
        
        // Create CSV headers
        const headers = [
          'Strain Number', 'Strain Type', 'Zone', 'Leaf Status', 'Internodes Number',
          'Internodes Spacing', 'Height', 'Width', 'Root Spaghetti', 'Stem Rigidity',
          'Side Shoot Activation', 'Symmetry', 'Total Medium Value', 'Is Keeper Pheno',
          'Is Candidate For Cloning', 'Training Methods', 'Germination Date'
        ];
        
        // Create CSV rows
        const rows = plants.map(plant => [
          plant.strainNumber,
          plant.strainType,
          plant.zone,
          plant.leafStatus,
          plant.internodesNumber,
          plant.internodesSpacing,
          plant.height,
          plant.width,
          plant.rootSpaghetti,
          plant.stemRigidity,
          plant.sideShootActivation,
          plant.symmetry,
          plant.totalMediumValue,
          plant.isKeeperPheno,
          plant.isCandidateForCloning,
          plant.trainingMethods?.join(';') || '',
          plant.germinationDate
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ganjapal-plants-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      setImportStatus({ type: 'success', message: `Data exported as ${exportFormat.toUpperCase()}` });
    } catch (error) {
      console.error('Export error:', error);
      setImportStatus({ type: 'error', message: `Export failed: ${error.message}` });
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      AppStorage.clearAllData();
      setImportStatus({ type: 'success', message: 'All data cleared successfully' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const currentData = AppStorage.exportData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Data Management</h2>
        </div>
      </div>

      {/* Status Alert */}
      {importStatus && (
        <Alert className={`border-${importStatus.type === 'error' ? 'red' : importStatus.type === 'success' ? 'green' : importStatus.type === 'warning' ? 'yellow' : 'blue'}-500`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={`text-${importStatus.type === 'error' ? 'red' : importStatus.type === 'success' ? 'green' : importStatus.type === 'warning' ? 'yellow' : 'blue'}-700`}>
            {importStatus.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Plant Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload File (Excel, CSV, or JSON)
                </label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv,.json"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Supported formats: Excel (.xlsx, .xls), CSV (.csv), JSON (.json)
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Tray Allocation System</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-2 bg-white rounded border">
                    <div className="font-medium">Large Tray</div>
                    <div className="text-gray-600">2 rows × 5 columns</div>
                    <div className="text-gray-600">Capacity: 10 plants</div>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <div className="font-medium">Small Tray</div>
                    <div className="text-gray-600">2 rows × 3 columns</div>
                    <div className="text-gray-600">Capacity: 6 plants</div>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <div className="font-medium">Round Tray</div>
                    <div className="text-gray-600">6 perimeter + 1 center</div>
                    <div className="text-gray-600">Capacity: 7 plants</div>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <div className="font-medium">Planter</div>
                    <div className="text-gray-600">3 rows × 7 columns*</div>
                    <div className="text-gray-600">Capacity: 17 plants</div>
                    <div className="text-xs text-gray-500">*Center row only 3 plants</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="json">JSON (Complete Data)</option>
                  <option value="csv">CSV (Plants Only)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 border rounded">
                  <div className="font-medium">Plants</div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentData.plantProfiles?.length || 0}
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <div className="font-medium">Timeline Events</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {currentData.timelineEvents?.length || 0}
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <div className="font-medium">Last Export</div>
                  <div className="text-sm text-gray-600">
                    {currentData.exportDate ? new Date(currentData.exportDate).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>

              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data as {exportFormat.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Data Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-700 mb-3">
                  This will permanently delete all plants, timeline events, and settings. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={handleClearAllData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Preview Dialog */}
      {showImportPreview && importData && (
        <ImportPreview
          data={importData}
          onConfirm={handleImportConfirm}
          onCancel={() => {
            setShowImportPreview(false);
            setImportData(null);
          }}
          onTrayAllocationChange={setTrayAllocations}
        />
      )}
    </div>
  );
};

// Helper to validate plant defaults
function validatePlantDefaults(plant) {
  // Ensure zone is valid
  if (!Object.values(ZONE_TYPES).includes(plant.zone)) {
    plant.zone = ZONE_TYPES.BIG_TRAY;
  }
  // Ensure numeric fields
  plant.totalMediumValue = typeof plant.totalMediumValue === 'number' ? plant.totalMediumValue : 0.5;
  plant.isKeeperPheno = !!plant.isKeeperPheno;
  plant.isCandidateForCloning = !!plant.isCandidateForCloning;
  return plant;
}

export default DataManagement;

