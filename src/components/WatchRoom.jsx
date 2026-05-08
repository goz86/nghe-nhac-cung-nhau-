import { useState, useRef, useEffect } from 'react'
import { useRoomMessages } from '../lib/useRooms'
import { useAuth } from '../lib/auth'

const CLIPS = [
  { id: 'jNQXAC9IVRw', title: 'Mèo nhảy theo nhạc K-Pop 🐱', views: '2.3M' },
  { id: 'kJQP7kiw5Fk', title: 'Bạn học làm bánh thất bại 😅', views: '856K' },
  { id: '9bZkp7q19f0', title: 'Review mì cay 7 cấp độ 🌶️', views: '1.1M' },
  { id: 'RgKAFK5djSk', title: 'Wiro Sableng - Funny moments', views: '520K' },
  { id: 'QH2-TGUlwu4', title: 'Học tiếng Hàn qua K-Drama', views: '780K' },
]

export default function WatchRoom({ room, onBack }) {
  const { user } = useAuth()
  const { messages: chat, sendMessage, loading: chatLoading } = useRoomMessages(room.id)
  const chatEnd = useRef(null)

  const [currentClip, setCurrentClip] = useState(0)
  const [reactions, setReactions] = useState([])
  const [chatMsg, setChatMsg] = useState('')

  const clip = CLIPS[currentClip]

  const addReaction = (emoji) => {
    setReactions(prev => [...prev, { emoji, id: Date.now() }])
    setTimeout(() => setReactions(prev => prev.slice(1)), 1200)
  }

  const handleSend = () => {
    if (chatMsg.trim()) { sendMessage(chatMsg); setChatMsg('') }
  }

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  return (
    <div className="min-h-screen bg-cream pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-latte hover:text-mocha transition-colors mb-6 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Player */}
          <div className="lg:col-span-3 space-y-5">
            {/* YouTube embed */}
            <div className="bg-white rounded-2xl border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)] overflow-hidden">
              <div className="aspect-video bg-[#1C1917] relative">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${clip.id}?rel=0&modestbranding=1&controls=1`}
                  title={clip.title}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
                {/* Reaction overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {reactions.map(r => (
                    <span key={r.id} className="absolute text-3xl anim-reaction"
                      style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 40}%` }}>
                      {r.emoji}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentClip(p => p > 0 ? p - 1 : CLIPS.length - 1)}
                    className="w-9 h-9 rounded-full bg-cream hover:bg-blush flex items-center justify-center text-latte hover:text-mocha transition-all cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>
                  <span className="text-xs font-medium text-latte">{currentClip + 1}/{CLIPS.length}</span>
                  <button onClick={() => setCurrentClip(p => p < CLIPS.length - 1 ? p + 1 : 0)}
                    className="w-9 h-9 rounded-full bg-cream hover:bg-blush flex items-center justify-center text-latte hover:text-mocha transition-all cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  </button>
                </div>
                <span className="text-xs text-latte">👀 {room.watchers} đang xem</span>
              </div>
              <div className="px-4 pb-3 -mt-1">
                <p className="text-sm font-semibold text-mocha truncate">{clip.title}</p>
                <p className="text-xs text-latte">{clip.views} lượt xem</p>
              </div>
            </div>

            {/* Reactions */}
            <div className="bg-white rounded-2xl p-4 border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)]">
              <div className="flex items-center justify-center gap-3">
                {['🔥', '😂', '😱', '💀', '❤️', '🥺'].map(emoji => (
                  <button key={emoji} onClick={() => addReaction(emoji)}
                    className="w-11 h-11 rounded-full bg-cream hover:bg-blush flex items-center justify-center text-xl transition-all active:scale-125 shadow-sm hover:shadow-md cursor-pointer">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue */}
            <div className="bg-white rounded-2xl p-5 border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)]">
              <h3 className="text-sm font-semibold text-mocha mb-3">📋 Tiếp theo</h3>
              <div className="space-y-1">
                {CLIPS.map((c, i) => (
                  <button key={i} onClick={() => setCurrentClip(i)}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-colors cursor-pointer ${
                      i === currentClip
                        ? 'bg-blush text-terracotta font-medium'
                        : 'text-latte hover:bg-cream hover:text-mocha'
                    }`}>
                    <span className="mr-2">{i + 1}.</span> {c.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)] flex flex-col h-[450px]">
              <div className="px-4 py-3 border-b border-blush-border/50">
                <h3 className="text-sm font-semibold text-mocha">💬 Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {chatLoading ? (
                  <div className="text-center py-8">
                    <span className="w-5 h-5 border-2 border-blush-border border-t-terracotta rounded-full animate-spin inline-block" />
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
    </div>
  )
}
