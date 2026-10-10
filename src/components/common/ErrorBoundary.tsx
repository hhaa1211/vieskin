import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Đã xảy ra lỗi kết xuất không mong muốn' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('vpr_current_draft_v1');
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-stone-900 dark:text-stone-100">
          <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Đã Khôi Phục Phiên Làm Việc An Toàn
            </h2>
            
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Ứng dụng vừa bảo vệ trạng thái của bạn khỏi sự cố ngoài ý muốn. Dữ liệu bộ sưu tập của bạn vẫn được lưu giữ an toàn trên thiết bị.
            </p>

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tải lại và khôi phục giao diện</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
