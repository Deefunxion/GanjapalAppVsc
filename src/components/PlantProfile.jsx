import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Camera, 
  Scissors, 
  Plus, 
  Calendar,
  Star,
  Dna,
  Edit,
  Save,
  X
} from 'lucide-react';
import { TRAINING_METHODS, ZONE_TYPES, getScoreColor, getTrainingBadgeClass } from '../data/plantData';
import { samplePlants } from '../data/plantData';
import { toast } from "sonner";

const getPlants = () => {
  if (typeof window !== 'undefined' && window.AppStorage && window.AppStorage.plantProfiles && window.AppStorage.plantProfiles.length) {
    return window.AppStorage.plantProfiles;
  }
  return samplePlants;
};
const plants = getPlants();

const PlantProfile = ({ plant, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlant, setEditedPlant] = useState({
    ...plant,
    trainingMethods: plant.trainingMethods || [],
    notes: plant.notes || "",
    germinationDate: plant.germinationDate ? new Date(plant.germinationDate) : new Date(),
    lastUpdated: plant.lastUpdated ? new Date(plant.lastUpdated) : new Date(),
  });

  // Defensive: ensure currentPlant always has correct types
  const currentPlant = isEditing ? editedPlant : {
    ...plant,
    trainingMethods: plant.trainingMethods || [],
    notes: plant.notes || "",
    germinationDate: plant.germinationDate ? new Date(plant.germinationDate) : new Date(),
    lastUpdated: plant.lastUpdated ? new Date(plant.lastUpdated) : new Date(),
  };

  const handleSave = () => {
    // Update in AppStorage if available
    if (typeof window !== 'undefined' && window.AppStorage && window.AppStorage.plantProfiles) {
      const idx = window.AppStorage.plantProfiles.findIndex(p => p.id === editedPlant.id);
      if (idx !== -1) {
        window.AppStorage.plantProfiles[idx] = editedPlant;
        window.AppStorage.saveData();
      }
    }
    onUpdate(editedPlant);
    setIsEditing(false);
    toast.success("Plant profile saved!");
    // Optionally, reload to reflect changes everywhere
    // window.location.reload();
  };

  const handleCancel = () => {
    setEditedPlant(plant);
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setEditedPlant(prev => ({
      ...prev,
      [field]: value,
      lastUpdated: new Date()
    }));
  };

  const addTrainingMethod = (method) => {
    if (!editedPlant.trainingMethods.includes(method)) {
      updateField('trainingMethods', [...editedPlant.trainingMethods, method]);
    }
  };

  const removeTrainingMethod = (method) => {
    updateField('trainingMethods', editedPlant.trainingMethods.filter(m => m !== method));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Plant #{currentPlant.strainNumber} - {currentPlant.strainType}
              {currentPlant.isKeeperPheno && <Star className="w-5 h-5 text-yellow-500" />}
              {currentPlant.isCandidateForCloning && <Dna className="w-5 h-5 text-blue-500" />}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Zone: {currentPlant.zone} • Last updated: {currentPlant.lastUpdated instanceof Date ? currentPlant.lastUpdated.toLocaleDateString() : new Date(currentPlant.lastUpdated).toLocaleDateString()}
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="phenotype">Phenotype</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Strain Number</Label>
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={currentPlant.strainNumber}
                            onChange={(e) => updateField('strainNumber', parseInt(e.target.value))}
                          />
                        ) : (
                          <div className="font-mono text-lg">{currentPlant.strainNumber}</div>
                        )}
                      </div>
                      <div>
                        <Label>Zone</Label>
                        {isEditing ? (
                          <Select value={currentPlant.zone} onValueChange={(value) => updateField('zone', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ZONE_TYPES).map(zone => (
                                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div>{currentPlant.zone}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Strain Type</Label>
                      {isEditing ? (
                        <Input 
                          value={currentPlant.strainType}
                          onChange={(e) => updateField('strainType', e.target.value)}
                        />
                      ) : (
                        <div className="font-medium">{currentPlant.strainType}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={currentPlant.isAutoflower}
                          onChange={(e) => updateField('isAutoflower', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <Label>Autoflower</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={currentPlant.isKeeperPheno}
                          onChange={(e) => updateField('isKeeperPheno', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <Label>Keeper Pheno</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={currentPlant.isCandidateForCloning}
                          onChange={(e) => updateField('isCandidateForCloning', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <Label>Clone Candidate</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className={`text-3xl font-bold ${getScoreColor(currentPlant.totalMediumValue)}`}>
                        {currentPlant.totalMediumValue.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Score</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Height:</span>
                        <span className="font-mono">{currentPlant.height}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Width:</span>
                        <span className="font-mono">{currentPlant.width}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Symmetry:</span>
                        <span className="font-mono">{currentPlant.symmetry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stem Rigidity:</span>
                        <span className="font-mono">{currentPlant.stemRigidity}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-sm">Training Methods</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentPlant.trainingMethods.map((method, idx) => (
                          <span key={idx} className={getTrainingBadgeClass(method)}>
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="phenotype" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Phenotype Scoring</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Rate each characteristic on a scale of 0.0 to 1.0
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'leafStatus', label: 'Leaf Status', description: 'Overall leaf health and appearance' },
                    { key: 'internodesNumber', label: 'Internodes Number', description: 'Number of internodes' },
                    { key: 'internodesSpacing', label: 'Internodes Spacing', description: 'Spacing between internodes' },
                    { key: 'height', label: 'Height', description: 'Plant height development' },
                    { key: 'width', label: 'Width', description: 'Plant width and bushiness' },
                    { key: 'rootSpaghetti', label: 'Root Development', description: 'Root system complexity' },
                    { key: 'stemRigidity', label: 'Stem Rigidity', description: 'Stem strength and flexibility' },
                    { key: 'sideShootActivation', label: 'Side Shoot Activation', description: 'Branch development' },
                    { key: 'symmetry', label: 'Symmetry', description: 'Overall plant symmetry' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="font-medium">{label}</Label>
                          <div className="text-xs text-muted-foreground">{description}</div>
                        </div>
                        <div className={`font-mono text-lg ${getScoreColor(currentPlant[key])}`}>
                          {currentPlant[key].toFixed(2)}
                        </div>
                      </div>
                      {isEditing ? (
                        <Slider
                          value={[currentPlant[key]]}
                          onValueChange={([value]) => updateField(key, value)}
                          max={1}
                          min={0}
                          step={0.01}
                          className="w-full"
                        />
                      ) : (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${currentPlant[key] * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Training Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Active Training Methods</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentPlant.trainingMethods.map((method, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {method}
                          {isEditing && (
                            <button 
                              onClick={() => removeTrainingMethod(method)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {isEditing && (
                    <div>
                      <Label>Add Training Method</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.values(TRAINING_METHODS).map(method => (
                          <Button
                            key={method}
                            variant="outline"
                            size="sm"
                            onClick={() => addTrainingMethod(method)}
                            disabled={currentPlant.trainingMethods.includes(method)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {method}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Scissors className="w-4 h-4" />
                      Log Training Event
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Add Training Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 border rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Germination</div>
                        <div className="text-sm text-muted-foreground">
                          {currentPlant.germinationDate instanceof Date ? currentPlant.germinationDate.toLocaleDateString() : new Date(currentPlant.germinationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-muted-foreground py-8">
                      Training events and milestones will appear here
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes & Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      placeholder="Add your observations, notes, and insights about this plant..."
                      className="min-h-32"
                      value={currentPlant.notes}
                      onChange={e => setEditedPlant(prev => ({ ...prev, notes: e.target.value, lastUpdated: new Date() }))}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      {currentPlant.notes && currentPlant.notes.trim() !== "" ? (
                        <div className="whitespace-pre-line text-left text-black/90">{currentPlant.notes}</div>
                      ) : (
                        "No notes yet. Click Edit to add observations."
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantProfile;

