import { useState, useRef, useEffect } from 'react'
import { useRoomMessages } from '../lib/useRooms'
import { useAuth } from '../lib/auth'

const PLAYLIST = [
  { id: 'dT2owYzkOaM', title: 'see tình - Hoàng Thùy Linh', duration: '3:45' },
  { id: 'mH_LFkWc8KQ', title: 'Ditto - NewJeans', duration: '3:05' },
  { id: 'a1WrXwBkKcE', title: 'Ngủ Một Mình - Ngọt', duration: '4:12' },
  { id: 'i1xGq2k2QYw', title: 'Chạy Về Khóc Với Anh - HuyR', duration: '4:30' },
  { id: 'fJ9rZzT0d5I', title: 'Lofi Study Beats', duration: '60:00' },
]

export default function MusicRoom({ room, onBack }) {
  const { user } = useAuth()
  const { messages: chat, sendMessage, loading: chatLoading } = useRoomMessages(room.id)
  const chatEnd = useRef(null)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [reactions, setReactions] = useState([])
  const [chatMsg, setChatMsg] = useState('')

  const song = PLAYLIST[currentIdx]

  const addReaction = (emoji) => {
    setReactions(prev => [...prev, { emoji, id: Date.now() }])
    setTimeout(() => setReactions(prev => prev.slice(1)), 1200)
  }

  const handleSend = () => {
    if (chatMsg.trim()) { sendMessage(chatMsg); setChatMsg('') }
  }

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-blush pt-20 pb-10 px-4">
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
            <div className="bg-white rounded-2xl overflow-hidden border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)]">
              <div className="aspect-video bg-[#1C1917] relative">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${song.id}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1&controls=1`}
                  title={song.title}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>

              {/* Controls */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentIdx(p => (p - 1 + PLAYLIST.length) % PLAYLIST.length)}
                      className="w-9 h-9 rounded-full bg-cream hover:bg-blush flex items-center justify-center text-latte hover:text-mocha transition-all cursor-pointer">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center text-white shadow-[0_4px_10px_rgba(182,129,118,0.3)] hover:shadow-[0_8px_20px_rgba(182,129,118,0.35)] active:scale-95 transition-all cursor-pointer">
                      {isPlaying
                        ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                    </button>
                    <button onClick={() => setCurrentIdx(p => (p + 1) % PLAYLIST.length)}
                      className="w-9 h-9 rounded-full bg-cream hover:bg-blush flex items-center justify-center text-latte hover:text-mocha transition-all cursor-pointer">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-2 max-w-[100px]">
                    <svg className="w-4 h-4 text-latte" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(e.target.value)}
                      className="flex-1 h-1.5 appearance-none bg-blush rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-terracotta" />
                  </div>
                </div>

                <p className="text-sm font-semibold text-mocha truncate">{song.title}</p>
                <p className="text-xs text-latte">{PLAYLIST.length} bài · {room.listeners} đang nghe</p>
              </div>
            </div>

            {/* Reactions */}
            <div className="bg-white rounded-2xl p-4 border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)]">
              <div className="flex items-center justify-center gap-3">
                {['🔥', '❤️', '😂', '😭', '💀', '🎵'].map(emoji => (
                  <button key={emoji} onClick={() => addReaction(emoji)}
                    className="w-10 h-10 rounded-full bg-cream hover:bg-blush flex items-center justify-center text-lg transition-all active:scale-125 cursor-pointer">
                    {emoji}
                  </button>
                ))}
                {reactions.map(r => (
                  <span key={r.id} className="fixed text-2xl pointer-events-none anim-reaction" style={{ bottom: '40%', left: '50%' }}>
                    {r.emoji}
                  </span>
                ))}
              </div>
            </div>

            {/* Queue */}
            <div className="bg-white rounded-2xl p-5 border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)]">
              <h3 className="text-sm font-semibold text-mocha mb-3">📋 Hàng chờ</h3>
              <div className="space-y-1">
                {PLAYLIST.map((s, i) => (
                  <button key={i} onClick={() => setCurrentIdx(i)}
                    className={`w-full text-left p-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                      i === currentIdx ? 'bg-blush text-terracotta font-medium' : 'text-latte hover:bg-cream hover:text-mocha'
                    }`}>
                    <div className="flex items-center gap-2">
                      {i === currentIdx && isPlaying && (
                        <div className="flex gap-[1.5px] items-end h-3">
                          {[1,2,3].map(n => <div key={n} className="eq-bar w-[2px]" />)}
                        </div>
                      )}
                      <span>{i + 1}.</span>
                      <span className="flex-1 truncate">{s.title}</span>
                      <span className="text-xs text-latte font-mono">{s.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-blush-border shadow-[0_8px_30px_rgb(92,69,60,0.06)] flex flex-col h-[450px]">
              <div className="px-4 py-3 border-b border-blush-border/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-mocha">💬 Chat</h3>
                <span className="text-xs text-latte">{room.listeners} đang nghe</span>
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
