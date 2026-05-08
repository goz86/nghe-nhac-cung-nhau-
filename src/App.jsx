import { useState } from 'react'
import { AuthProvider } from './lib/auth'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import RoomGrid from './components/RoomGrid'
import Dashboard from './components/Dashboard'
import CreateRoomModal from './components/CreateRoomModal'
import AuthModal from './components/AuthModal'
import ProfileModal from './components/ProfileModal'
import FriendsModal from './components/FriendsModal'
import ToastContainer, { useToast } from './components/Toast'
import { useRooms, useFriends } from './lib/useRooms'

function AppContent() {
  const [activeTab, setActiveTab] = useState('hero')
  const [showCreate, setShowCreate] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showFriends, setShowFriends] = useState(false)

  const study = useRooms('study')
  const music = useRooms('music')
  const watch = useRooms('watch')
  const { requests: friendRequests } = useFriends()

  const { toasts, addToast, removeToast } = useToast()

  const handleRoomCreated = (newRoom) => {
    setShowCreate(false)
    addToast(`🎉 Đã tạo phòng "${newRoom.name}" thành công!`, 'success')
  }

  return (
    <div className="bg-cream min-h-screen text-mocha">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCreateRoom={() => setShowCreate(true)}
        onAuth={() => setShowAuth(true)}
        onProfile={() => setShowProfile(true)}
        onFriends={() => setShowFriends(true)}
        friendRequestCount={friendRequests?.length || 0}
      />

      <main>
        {activeTab === 'hero' && <Hero setActiveTab={setActiveTab} onCreateRoom={() => setShowCreate(true)} />}
        {activeTab === 'dashboard' && <Dashboard />}

        <div className={activeTab !== 'hero' ? 'pt-24' : ''}>
          {activeTab !== 'hero' && activeTab !== 'dashboard' && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
              <button onClick={() => setActiveTab('hero')}
                className="text-sm text-latte hover:text-mocha transition-colors cursor-pointer flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trang chủ
              </button>
            </div>
          )}
          <RoomGrid type="study" rooms={study.rooms} loading={study.loading} />
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-blush-border to-transparent" />
          </div>
          <RoomGrid type="music" rooms={music.rooms} loading={music.loading} />
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-blush-border to-transparent" />
          </div>
          <RoomGrid type="watch" rooms={watch.rooms} loading={watch.loading} />
        </div>
      </main>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={handleRoomCreated} createRoom={study.createRoom} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showFriends && <FriendsModal onClose={() => setShowFriends(false)} addToast={addToast} />}

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
                Nền tảng kết nối du học sinh Việt tại Hàn Quốc. Học tập, giải trí và kết bạn — không còn cô đơn nơi xứ người.
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
            Made with ☕ & 🤝 by StudyWith.Me community
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
