import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <span className="text-5xl mb-4 block">😅</span>
            <h1 className="text-xl font-bold text-mocha mb-2">Có chút vấn đề</h1>
            <p className="text-sm text-latte mb-6">
              Đã xảy ra lỗi. Bạn thử refresh lại nhé.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-terracotta text-white font-semibold rounded-2xl hover:bg-terracotta-dark transition-all cursor-pointer"
            >
              🔄 Refresh
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-latte cursor-pointer">Chi tiết lỗi</summary>
                <pre className="text-xs text-rose-500 mt-2 p-3 bg-rose-50 rounded-xl overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
