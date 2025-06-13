// Toast Notification System for Grow Automation Assistant
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showToast: addToast // Alias for easier usage
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  const getToastStyles = () => {
    const baseStyles = "flex items-center p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out transform translate-x-0";
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case TOAST_TYPES.ERROR:
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case TOAST_TYPES.WARNING:
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case TOAST_TYPES.INFO:
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 mr-3 flex-shrink-0";
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case TOAST_TYPES.ERROR:
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      case TOAST_TYPES.WARNING:
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case TOAST_TYPES.INFO:
      default:
        return <Info className={`${iconClass} text-blue-600`} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Global toast function for window object
export const initializeGlobalToast = (showToast) => {
  if (typeof window !== 'undefined') {
    window.showToast = showToast;
  }
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

// Loading Button Component
export const LoadingButton = ({ 
  loading, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  disabled,
  ...props 
}) => {
  return (
    <button
      className={`flex items-center justify-center gap-2 ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {loading ? loadingText : children}
    </button>
  );
};

// Progress Bar Component
export const ProgressBar = ({ 
  progress, 
  className = '', 
  showPercentage = true,
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// Status Badge Component
export const StatusBadge = ({ status, className = '' }) => {
  const getStatusStyles = () => {
    const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'active':
        return `${baseStyles} bg-green-100 text-green-800`;
      case 'error':
      case 'failed':
        return `${baseStyles} bg-red-100 text-red-800`;
      case 'warning':
      case 'pending':
        return `${baseStyles} bg-yellow-100 text-yellow-800`;
      case 'info':
      case 'processing':
        return `${baseStyles} bg-blue-100 text-blue-800`;
      case 'inactive':
      case 'disabled':
        return `${baseStyles} bg-gray-100 text-gray-800`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <span className={`${getStatusStyles()} ${className}`}>
      {status}
    </span>
  );
};

// Confirmation Dialog Hook
export const useConfirmDialog = () => {
  const { showToast } = useToast();

  const confirm = useCallback((message, onConfirm, onCancel) => {
    const result = window.confirm(message);
    if (result) {
      onConfirm?.();
    } else {
      onCancel?.();
    }
    return result;
  }, []);

  const confirmAsync = useCallback((message) => {
    return new Promise((resolve) => {
      const result = window.confirm(message);
      resolve(result);
    });
  }, []);

  return { confirm, confirmAsync };
};

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Show toast notification if available
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast('An unexpected error occurred. Please refresh the page.', 'error');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
            </div>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default {
  ToastProvider,
  useToast,
  TOAST_TYPES,
  LoadingSpinner,
  LoadingButton,
  ProgressBar,
  StatusBadge,
  useConfirmDialog,
  ErrorBoundary,
  initializeGlobalToast
};

