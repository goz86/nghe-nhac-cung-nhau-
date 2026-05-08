import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'

const tabs = [
  { id: 'hero', label: '🏠 Trang chủ' },
  { id: 'study', label: '📚 Học cùng' },
  { id: 'music', label: '🎵 Nghe cùng' },
  { id: 'watch', label: '📱 Xem cùng' },
  { id: 'dashboard', label: '📊 Stats' },
]

export default function Navbar({ activeTab, setActiveTab, onCreateRoom, onAuth, onProfile, onFriends, friendRequestCount = 0 }) {
  const { user, profile, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleTab = (id) => {
    setActiveTab(id)
    setMenuOpen(false)
    if (id === 'hero') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = async () => {
    try { await signOut(); setShowDropdown(false) }
    catch (err) { console.error(err) }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').pop().charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-panel shadow-warm-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleTab('hero')}
            className="flex items-center gap-2 group cursor-pointer">
            <span className="text-2xl">🤝</span>
            <span className="text-lg font-bold text-mocha group-hover:text-terracotta transition-colors">
              StudyWith.Me
            </span>
          </button>

          {/* Desktop tabs */}
          <div className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => handleTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blush text-terracotta shadow-sm'
                    : 'text-latte hover:text-mocha hover:bg-blush/50'
                }`}>
                {tab.label}
                {activeTab === tab.id && <span className="tab-pill-active" />}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              className="w-9 h-9 rounded-full bg-blush flex items-center justify-center text-latte hover:text-mocha transition-all cursor-pointer">
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Create room */}
            <button onClick={onCreateRoom}
              className="hidden sm:inline-flex px-3.5 py-2 text-sm font-medium text-terracotta bg-blush hover:bg-blush-border transition-colors rounded-xl cursor-pointer items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo phòng
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer">
                  {initials}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-blush-border shadow-warm-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-blush-border/50">
                      <p className="text-sm font-semibold text-mocha truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-latte truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { onProfile(); setShowDropdown(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-mocha hover:bg-cream transition-colors cursor-pointer flex items-center gap-2">
                        <span>👤</span> Trang cá nhân
                      </button>
                      <button onClick={() => { onFriends(); setShowDropdown(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-mocha hover:bg-cream transition-colors cursor-pointer flex items-center gap-2">
                        <span>⭐</span> Bạn bè
                        {friendRequestCount > 0 && (
                          <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {friendRequestCount}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="border-t border-blush-border/50 py-1">
                      <button onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-2">
                        <span>🚪</span> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={onAuth}
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-latte hover:text-mocha transition-colors rounded-xl hover:bg-blush cursor-pointer">
                  Đăng nhập
                </button>
                <button onClick={onAuth}
                  className="px-4 py-2 text-sm font-semibold text-white bg-terracotta hover:bg-terracotta-dark rounded-xl transition-all duration-200 shadow-[0_4px_10px_rgba(182,129,118,0.3)] hover:shadow-[0_8px_20px_rgba(182,129,118,0.35)] active:scale-95 cursor-pointer">
                  Đăng ký
                </button>
              </>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-mocha hover:text-terracotta transition-colors cursor-pointer">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => handleTab(tab.id)}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id ? 'bg-blush text-terracotta' : 'text-latte hover:text-mocha hover:bg-blush/50'
                }`}>
                {tab.label}
              </button>
            ))}
            <div className="pt-2 border-t border-blush-border/50 mt-2 space-y-1">
              <button onClick={() => { onCreateRoom(); setMenuOpen(false) }}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-terracotta hover:bg-terracotta-dark transition-all cursor-pointer text-center">
                ✨ Tạo phòng mới
              </button>
              {!user && (
                <button onClick={() => { onAuth(); setMenuOpen(false) }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-mocha border border-blush-border hover:bg-cream transition-all cursor-pointer text-center">
                  🔑 Đăng nhập / Đăng ký
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showDropdown && <div className="fixed inset-0 z-[-1]" onClick={() => setShowDropdown(false)} />}
    </nav>
  )
}
