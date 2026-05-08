import { useState, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AuthProvider, useAuth } from './lib/auth'
import Navbar from './components/Navbar'
import ToastContainer, { useToast } from './components/Toast'
import { useFriends } from './lib/useRooms'

// Lazy-loaded pages
const Hero = lazy(() => import('./components/Hero'))
const Dashboard = lazy(() => import('./components/Dashboard'))
const StudyRoom = lazy(() => import('./components/StudyRoom'))
const MusicRoom = lazy(() => import('./components/MusicRoom'))
const WatchRoom = lazy(() => import('./components/WatchRoom'))
const RoomGridPage = lazy(() => import('./components/RoomGridPage'))
const CreateRoomModal = lazy(() => import('./components/CreateRoomModal'))
const AuthModal = lazy(() => import('./components/AuthModal'))
const ProfileModal = lazy(() => import('./components/ProfileModal'))
const FriendsModal = lazy(() => import('./components/FriendsModal'))

function PageLoading() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
      <div className="w-8 h-8 border-3 border-blush-border border-t-terracotta rounded-full animate-spin" />
    </div>
  )
}

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { requests: friendRequests } = useFriends()
  const { toasts, addToast, removeToast } = useToast()

  const [showCreate, setShowCreate] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showFriends, setShowFriends] = useState(false)

  const activeTab = location.pathname === '/' ? 'hero'
    : location.pathname.startsWith('/study') ? 'study'
    : location.pathname.startsWith('/music') ? 'music'
    : location.pathname.startsWith('/watch') ? 'watch'
    : location.pathname.startsWith('/dashboard') ? 'dashboard'
    : 'hero'

  const handleRoomCreated = () => {
    setShowCreate(false)
    addToast('🎉 Phòng đã được tạo!', 'success')
  }

  const pageTitle = activeTab === 'hero' ? 'StudyWith.Me — Học cùng nhau'
    : activeTab === 'study' ? 'Phòng học — StudyWith.Me'
    : activeTab === 'music' ? 'Phòng nhạc — StudyWith.Me'
    : activeTab === 'watch' ? 'Xem cùng — StudyWith.Me'
    : activeTab === 'dashboard' ? 'Dashboard — StudyWith.Me'
    : 'StudyWith.Me'

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content="Nền tảng kết nối du học sinh Việt tại Hàn Quốc" />
        <meta property="og:type" content="website" />
        <meta name="description" content="Học tập, giải trí và kết bạn cùng du học sinh Việt tại Hàn Quốc." />
      </Helmet>

      <div className="bg-cream min-h-screen text-mocha">
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            const paths = { hero: '/', study: '/study', music: '/music', watch: '/watch', dashboard: '/dashboard' }
            navigate(paths[tab] || '/')
          }}
          onCreateRoom={() => user ? setShowCreate(true) : setShowAuth(true)}
          onAuth={() => setShowAuth(true)}
          onProfile={() => setShowProfile(true)}
          onFriends={() => setShowFriends(true)}
          friendRequestCount={friendRequests?.length || 0}
        />

        <main>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/study" element={<RoomGridPage type="study" />} />
              <Route path="/music" element={<RoomGridPage type="music" />} />
              <Route path="/watch" element={<RoomGridPage type="watch" />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </main>

        {showCreate && (
          <Suspense fallback={null}>
            <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={handleRoomCreated} />
          </Suspense>
        )}
        {showAuth && (
          <Suspense fallback={null}>
            <AuthModal onClose={() => setShowAuth(false)} />
          </Suspense>
        )}
        {showProfile && (
          <Suspense fallback={null}>
            <ProfileModal onClose={() => setShowProfile(false)} />
          </Suspense>
        )}
        {showFriends && (
          <Suspense fallback={null}>
            <FriendsModal onClose={() => setShowFriends(false)} addToast={addToast} />
          </Suspense>
        )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Footer */}
        <footer className="border-t border-blush-border bg-white/60 mt-12 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🤝</span>
                  <span className="font-bold text-mocha">StudyWith.Me</span>
                </div>
                <p className="text-sm text-latte leading-relaxed">
                  Nền tảng kết nối du học sinh Việt tại Hàn Quốc.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-mocha mb-3">Khám phá</h4>
                <div className="space-y-2">
                  {['Phòng học', 'Phòng nhạc', 'Xem cùng', 'Kết bạn'].map(item => (
                    <div key={item} className="text-sm text-latte hover:text-terracotta transition-colors cursor-pointer">{item}</div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-mocha mb-3">Về chúng tôi</h4>
                <div className="space-y-2">
                  {['Ý tưởng', 'Blog', 'Liên hệ', 'Điều khoản'].map(item => (
                    <div key={item} className="text-sm text-latte hover:text-terracotta transition-colors cursor-pointer">{item}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-blush-border/50 text-center text-xs text-latte">
              Made with ☕ & 🤝 · StudyWith.Me
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
