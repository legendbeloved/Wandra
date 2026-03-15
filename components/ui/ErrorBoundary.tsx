"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Global Error Boundary for catching unexpected React rendering errors.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to production log drain or analytics
    console.error("[REACT_UI_ERROR]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B3D4A] flex items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            <h1 className="font-serif text-[28px] text-white mb-3">Something went wrong</h1>
            <p className="text-sand-300 text-[15px] leading-relaxed mb-10">
              Wandra hit an unexpected bump in the road. Even the best explorers get lost sometimes.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="h-[52px] bg-red-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
              
              <Link
                href="/home"
                className="h-[52px] border border-white/10 text-sand-200 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Safety
              </Link>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
