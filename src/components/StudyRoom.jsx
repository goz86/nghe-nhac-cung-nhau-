import { useState, useEffect, useRef } from 'react'
import { useRoomMessages, usePomodoro } from '../lib/useRooms'
import { useAuth } from '../lib/auth'

export default function StudyRoom({ room, onBack }) {
  const { user } = useAuth()
  const { messages: chat, sendMessage, loading: chatLoading } = useRoomMessages(room.id)
  const { saveSession } = usePomodoro(room.id)

  const [focusSeconds, setFocusSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('focus')
  const [chatMsg, setChatMsg] = useState('')
  const chatEnd = useRef(null)

  const duration = mode === 'focus' ? 25 * 60 : 5 * 60
  const remaining = duration - focusSeconds
  const progress = (focusSeconds / duration) * 100
  const circumference = 2 * Math.PI * 42

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setFocusSeconds(prev => {
          if (prev >= duration - 1) {
            setIsRunning(false)
            saveSession(duration)
            setMode(m => m === 'focus' ? 'break' : 'focus')
            return 0
          }
          return prev + 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning, duration, mode, saveSession])

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  const handleSend = () => {
    if (chatMsg.trim()) { sendMessage(chatMsg); setChatMsg('') }
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Copy room link
  const copyLink = () => {
    const url = `${window.location.origin}/room/${room.id}`
    navigator.clipboard.writeText(url).then(() => {
      const el = document.createElement('div')
      el.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 bg-terracotta text-white text-sm rounded-2xl shadow-warm-md z-[70] animate-scale-in'
      el.textContent = '🔗 Đã copy link!'
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 2000)
    }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-cream pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back + Share */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-latte hover:text-mocha transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <button onClick={copyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-terracotta bg-blush rounded-xl hover:bg-blush-border transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Chia sẻ
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-mocha">{room.name}</h1>
          <span className="px-2.5 py-1 text-xs font-medium bg-blush text-terracotta rounded-full">
            👥 {room.members}/{room.maxMembers}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)]">
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40 sm:w-48 sm:h-48 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#EFE3DD" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={mode === 'focus' ? '#B68176' : '#6EE7B7'}
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progress / 100)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-4xl sm:text-5xl font-bold font-mono text-mocha tracking-tight">
                      {fmt(remaining)}
                    </div>
                    <div className="text-sm text-latte mt-1 font-medium uppercase tracking-wider">
                      {mode === 'focus' ? '⚡ Tập trung' : '☕ Nghỉ ngơi'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <button onClick={() => setIsRunning(!isRunning)}
                  className={`px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-95 cursor-pointer ${
                    isRunning
                      ? 'bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100'
                      : 'bg-terracotta text-white shadow-[0_4px_10px_rgba(182,129,118,0.3)] hover:shadow-[0_8px_20px_rgba(182,129,118,0.35)]'
                  }`}>
                  {isRunning ? '⏸ Tạm dừng' : '▶ Bắt đầu'}
                </button>
                <button onClick={() => { setIsRunning(false); setFocusSeconds(0); setMode('focus') }}
                  className="px-6 py-3 rounded-2xl text-sm font-medium text-latte border border-blush-border hover:bg-blush transition-all cursor-pointer">
                  🔄 Reset
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-blush-border/50">
                <span className="text-xs text-latte">Đang học cùng:</span>
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(room.members, 6) }).map((_, i) => (
                    <div key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta to-rose-400 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm">
                      {String.fromCharCode(65 + (room.id * 5 + i) % 26)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-latte ml-1">+{Math.max(0, room.members - 6)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {room.tags?.map((tag, i) => (
                <span key={i} className="px-3 py-1 text-xs font-medium bg-blush text-latte rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-2xl border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)] flex flex-col h-[450px]">
            <div className="px-4 py-3 border-b border-blush-border/50">
              <h3 className="text-sm font-semibold text-mocha">💬 Chat phòng</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {chatLoading ? (
                <div className="text-center py-8">
                  <span className="w-5 h-5 border-2 border-blush-border border-t-terracotta rounded-full animate-spin inline-block" />
                  <p className="text-xs text-latte mt-2">Đang tải...</p>
                </div>
              ) : (
                chat.map((msg, i) => (
                  <div key={i} className={msg.isOwn ? 'text-right' : ''}>
                    <div className={`flex items-baseline gap-2 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-xs font-semibold ${msg.isOwn ? 'text-mocha' : 'text-terracotta'}`}>{msg.user}</span>
                      <span className="text-[10px] text-latte">{msg.time}</span>
                    </div>
                    <p className={`text-sm mt-0.5 inline-block px-3 py-1.5 rounded-2xl max-w-[80%] ${
                      msg.isOwn ? 'bg-terracotta text-white rounded-tr-sm' : 'bg-cream text-mocha rounded-tl-sm'
                    }`}>{msg.msg}</p>
                  </div>
                ))
              )}
              <div ref={chatEnd} />
            </div>
            <div className="p-3 border-t border-blush-border/50 flex gap-2">
              <input type="text" value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={user ? "Nhắn gì đó..." : "Đăng nhập để chat"}
                disabled={!user}
                className="flex-1 px-3 py-2 text-sm bg-cream rounded-xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors placeholder:text-latte disabled:opacity-50" />
              <button onClick={handleSend} disabled={!user || !chatMsg.trim()}
                className="px-3 py-2 bg-terracotta text-white rounded-xl text-sm font-medium hover:bg-terracotta-dark active:scale-95 transition-all disabled:opacity-50 cursor-pointer">
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
