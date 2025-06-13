import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize storage utility
import AppStorage from './utils/storage.js'

// Make storage globally available for debugging
if (typeof window !== 'undefined') {
  window.AppStorage = AppStorage;
  
  // Add debug helpers
  window.debugGanjapal = {
    clearData: () => AppStorage.clearAllData(),
    exportData: () => AppStorage.exportData(),
    getPlants: () => AppStorage.getPlantProfiles(),
    getEvents: () => AppStorage.getTimelineEvents()
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

