// Enhanced Photo Management Component
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Camera,
  Upload,
  X,
  Download,
  Eye,
  Trash2,
  Calendar,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PhotoManager = ({ plantId = null, eventType = null, onPhotoAdded = null }) => {
  const [photos, setPhotos] = useState(
    typeof window !== 'undefined' && window.AppStorage && window.AppStorage.photos 
      ? window.AppStorage.photos 
      : []
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState(plantId || '');
  const [selectedEventType, setSelectedEventType] = useState(eventType || '');
  const [viewMode, setViewMode] = useState('upload'); // 'upload', 'gallery', 'manage'
  const fileInputRef = useRef(null);

  // Get available plants for selection
  const getPlants = () => {
    if (typeof window !== 'undefined' && window.AppStorage && window.AppStorage.plantProfiles) {
      return window.AppStorage.plantProfiles;
    }
    return [];
  };

  const plants = getPlants();

  const eventTypes = [
    'training',
    'watering',
    'feeding',
    'topping',
    'lst',
    'fimming',
    'supercropping',
    'repotting',
    'general',
    'problem',
    'harvest'
  ];

  // Compress image to reduce storage size
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setUploading(true);
    
    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          // Compress image if it's too large
          const compressedFile = file.size > 500000 ? await compressImage(file) : file;
          
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                file: compressedFile || file,
                originalFile: file,
                dataUrl: e.target.result,
                id: uuidv4()
              });
            };
            reader.readAsDataURL(compressedFile || file);
          });
        })
      );

      setSelectedFiles(processedFiles);
      setPreviews(processedFiles);
    } catch (error) {
      console.error('Error processing files:', error);
      if (window.showToast) {
        window.showToast('Error processing images. Please try again.', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUploadPhotos = () => {
    if (!previews.length) {
      if (window.showToast) {
        window.showToast('Please select photos to upload.', 'warning');
      }
      return;
    }

    const newPhotos = previews.map(({ dataUrl, originalFile, id }) => ({
      id,
      plantId: selectedPlantId,
      eventType: selectedEventType,
      fileName: originalFile.name,
      fileSize: originalFile.size,
      dataUrl,
      uploadDate: new Date().toISOString(),
      tags: []
    }));

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);

    // Save to AppStorage
    if (typeof window !== 'undefined' && window.AppStorage) {
      window.AppStorage.photos = updatedPhotos;
      window.AppStorage.saveData();
    }

    // Clear selections
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (window.showToast) {
      window.showToast(`Successfully uploaded ${newPhotos.length} photo(s)!`, 'success');
    }

    if (onPhotoAdded) {
      onPhotoAdded(newPhotos);
    }
  };

  const handleDeletePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);

    if (typeof window !== 'undefined' && window.AppStorage) {
      window.AppStorage.photos = updatedPhotos;
      window.AppStorage.saveData();
    }

    if (window.showToast) {
      window.showToast('Photo deleted successfully.', 'success');
    }
  };

  const removePreview = (previewId) => {
    setPreviews(prev => prev.filter(p => p.id !== previewId));
    setSelectedFiles(prev => prev.filter(p => p.id !== previewId));
  };

  const exportPhotos = () => {
    if (!photos.length) {
      if (window.showToast) {
        window.showToast('No photos to export.', 'warning');
      }
      return;
    }

    // Create a simple JSON export with photo metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      totalPhotos: photos.length,
      photos: photos.map(photo => ({
        id: photo.id,
        plantId: photo.plantId,
        eventType: photo.eventType,
        fileName: photo.fileName,
        uploadDate: photo.uploadDate,
        tags: photo.tags
        // Note: dataUrl excluded from export due to size
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-metadata-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast('Photo metadata exported successfully.', 'success');
    }
  };

  // Filter photos by plant or event type
  const filteredPhotos = photos.filter(photo => {
    if (plantId && photo.plantId !== plantId) return false;
    if (eventType && photo.eventType !== eventType) return false;
    return true;
  });

  // Group photos by plant
  const photosByPlant = photos.reduce((acc, photo) => {
    const key = photo.plantId || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});

  const getPlantName = (plantId) => {
    const plant = plants.find(p => p.id === plantId);
    return plant ? `Plant #${plant.strainNumber} (${plant.strainType})` : `Plant #${plantId}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Photo Management
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'upload' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('upload')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              variant={viewMode === 'gallery' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('gallery')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Gallery
            </Button>
            <Button
              variant={viewMode === 'manage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('manage')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {viewMode === 'upload' && (
          <div className="space-y-4">
            {/* Upload Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plant-select">Plant (Optional)</Label>
                <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plant..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific plant</SelectItem>
                    {plants.map(plant => (
                      <SelectItem key={plant.id} value={plant.id}>
                        Plant #{plant.strainNumber} - {plant.strainType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="event-select">Event Type (Optional)</Label>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General photo</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Input */}
            <div>
              <Label htmlFor="photo-upload">Select Photos</Label>
              <Input
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="mt-1"
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPG, PNG, WebP. Images will be compressed for storage.
              </p>
            </div>

            {/* Preview Grid */}
            {previews.length > 0 && (
              <div>
                <Label>Photo Previews</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {previews.map((preview) => (
                    <div key={preview.id} className="relative group">
                      <img
                        src={preview.dataUrl}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePreview(preview.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 right-1">
                        <Badge variant="secondary" className="text-xs truncate">
                          {preview.originalFile.name}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUploadPhotos}
              disabled={!previews.length || uploading}
              className="w-full"
            >
              {uploading ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {previews.length} Photo(s)
                </>
              )}
            </Button>
          </div>
        )}

        {viewMode === 'gallery' && (
          <div className="space-y-4">
            {/* Gallery Stats */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Total Photos: {photos.length}
              </div>
              <Button variant="outline" size="sm" onClick={exportPhotos}>
                <Download className="w-4 h-4 mr-2" />
                Export Metadata
              </Button>
            </div>

            {/* Photos by Plant */}
            {Object.keys(photosByPlant).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(photosByPlant).map(([plantId, plantPhotos]) => (
                  <div key={plantId}>
                    <h3 className="font-semibold mb-3">
                      {plantId === 'Unassigned' ? 'Unassigned Photos' : getPlantName(plantId)}
                      <Badge variant="secondary" className="ml-2">
                        {plantPhotos.length}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {plantPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.dataUrl}
                            alt={photo.fileName}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeletePhoto(photo.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="absolute bottom-1 left-1 right-1">
                            <div className="flex gap-1">
                              {photo.eventType && (
                                <Badge variant="outline" className="text-xs">
                                  {photo.eventType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first plant photos to get started.
                </p>
                <Button onClick={() => setViewMode('upload')}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photos
                </Button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'manage' && (
          <div className="space-y-4">
            {/* Management Tools */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Photo Management</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportPhotos}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all photos? This cannot be undone.')) {
                      setPhotos([]);
                      if (typeof window !== 'undefined' && window.AppStorage) {
                        window.AppStorage.photos = [];
                        window.AppStorage.saveData();
                      }
                      if (window.showToast) {
                        window.showToast('All photos deleted.', 'success');
                      }
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </div>
            </div>

            {/* Storage Info */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Photos</div>
                    <div className="font-semibold">{photos.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Storage Used</div>
                    <div className="font-semibold">
                      {(photos.reduce((sum, photo) => sum + (photo.fileSize || 0), 0) / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">With Plants</div>
                    <div className="font-semibold">{photos.filter(p => p.plantId).length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Unassigned</div>
                    <div className="font-semibold">{photos.filter(p => !p.plantId).length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Photos */}
            {photos.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Recent Photos</h4>
                <div className="space-y-2">
                  {photos
                    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
                    .slice(0, 10)
                    .map((photo) => (
                      <div key={photo.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo.dataUrl}
                            alt={photo.fileName}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{photo.fileName}</div>
                            <div className="text-sm text-muted-foreground">
                              {photo.plantId ? getPlantName(photo.plantId) : 'Unassigned'}
                              {photo.eventType && ` • ${photo.eventType}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {new Date(photo.uploadDate).toLocaleDateString()}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoManager;

