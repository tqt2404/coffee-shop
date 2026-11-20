import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Đã xảy ra sự cố không mong muốn.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F7F4] text-[#191715] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#FFFFFF] border border-[#DDD8CE] p-8 text-center">
            <p className="font-mono text-xs text-[#7A5C38] tracking-[0.12em]">
              NHÀ RANG LẠC SƠN
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-[#191715]">
              Phiên làm việc cần được tải lại
            </h1>
            <p className="mt-3 text-sm text-[#5C574F] leading-relaxed">
              Hệ thống vừa ghi nhận một lỗi kết nối hoặc dữ liệu. Vui lòng tải lại trang để
              tiếp tục trải nghiệm.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-3 min-h-[44px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors cursor-pointer"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
