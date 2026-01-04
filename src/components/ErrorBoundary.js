import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40 }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
