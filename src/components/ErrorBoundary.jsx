import React from 'react';

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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
          <div className="text-center border border-orange-500/30 p-8 rounded bg-black/50 max-w-lg w-full">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-6 font-mono text-sm break-words">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 transition-colors text-white rounded font-mono font-bold"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
