import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccessMsg(''); setIsLoading(true)
    try {
      if (mode === 'register') {
        if (!fullName.trim()) { setError('Nhập tên của bạn 📝'); setIsLoading(false); return }
        await signUp(email, password, fullName.trim())
        setSuccessMsg('🎉 Đăng ký thành công! Kiểm tra email để xác nhận.')
      } else {
        await signIn(email, password)
        onClose()
      }
    } catch (err) {
      if (err.message.includes('already registered')) setError('Email này đã đăng ký rồi 📧')
      else if (err.message.includes('Invalid login')) setError('Email hoặc mật khẩu không đúng 🔑')
      else setError(err.message)
    } finally { setIsLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-warm-xl anim-scale-in overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-terracotta via-rose-300 to-amber-200" />
        <button onClick={onClose}
          className="absolute top-6 right-5 w-8 h-8 rounded-full bg-cream hover:bg-blush flex items-center justify-center cursor-pointer z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">{mode === 'login' ? '🤝' : '🎉'}</span>
            <h2 className="text-xl font-bold text-mocha">{mode === 'login' ? 'Chào mừng trở lại!' : 'Tham gia ngay!'}</h2>
            <p className="text-sm text-latte mt-1">{mode === 'login' ? 'Đăng nhập để kết nối' : 'Tạo tài khoản và bắt đầu học'}</p>
          </div>

          {successMsg && <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-700">{successMsg}</div>}

          <form onSubmit={handleSubmit} className={`space-y-4 ${successMsg ? 'hidden' : ''}`}>
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-mocha mb-1.5 block">Tên</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-mocha mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com" required
                className="w-full px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte" />
            </div>
            <div>
              <label className="text-sm font-medium text-mocha mb-1.5 block">Mật khẩu</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="• • • • • •" required minLength={6}
                className="w-full px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte" />
            </div>

            {error && <div className="px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-500">😅 {error}</div>}

            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white bg-terracotta hover:bg-terracotta-dark shadow-[0_4px_10px_rgba(182,129,118,0.3)] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {mode === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...'}</>
              ) : (mode === 'login' ? '🚀 Đăng nhập' : '🎉 Đăng ký')}
            </button>
          </form>

          {!successMsg && (
            <div className="text-center mt-5 text-sm text-latte">
              {mode === 'login' ? (
                <>Chưa có tài khoản?{' '}<button onClick={() => { setMode('register'); setError('') }} className="text-terracotta font-medium hover:underline cursor-pointer">Đăng ký ngay</button></>
              ) : (
                <>Đã có tài khoản?{' '}<button onClick={() => { setMode('login'); setError('') }} className="text-terracotta font-medium hover:underline cursor-pointer">Đăng nhập</button></>
              )}
            </div>
          )}

          {successMsg && <button onClick={onClose} className="w-full mt-4 py-3 rounded-2xl text-sm font-medium text-mocha border border-blush-border hover:bg-cream transition-all cursor-pointer">Đóng</button>}
        </div>
      </div>
    </div>
  )
}
