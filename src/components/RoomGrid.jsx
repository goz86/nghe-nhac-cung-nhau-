import { useState } from 'react'
import StudyRoom from './StudyRoom'
import MusicRoom from './MusicRoom'
import WatchRoom from './WatchRoom'
import { RoomGridSkeleton } from './Skeleton'

function RoomCard({ room, onEnter }) {
  const icons = { study: '📚', music: '🎵', watch: '📱' }

  return (
    <button onClick={() => onEnter(room)}
      className="group relative p-5 rounded-2xl border border-blush-border bg-white hover:shadow-[0_8px_30px_rgb(163,112,102,0.08)] transition-all duration-300 cursor-pointer active:scale-[0.98] text-left">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icons[room.type]}</span>
          <div>
            <h3 className="font-semibold text-mocha text-sm sm:text-base leading-tight group-hover:text-terracotta transition-colors">
              {room.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-latte">
                {room.members || room.listeners || room.watchers} đang{' '}
                {room.type === 'study' ? 'học' : room.type === 'music' ? 'nghe' : 'xem'}
              </span>
              {room.streak > 0 && (
                <span className="text-[11px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full font-medium">
                  🔥 {room.streak} ngày
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {room.isLive !== undefined && (
            <span className={`w-2 h-2 rounded-full ${room.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-latte'}`} />
          )}
          <span className="text-[11px] text-latte font-medium">{room.isLive ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      <p className="text-sm text-latte mb-3 line-clamp-2">{room.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {room.tags?.slice(0, 3).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 text-[11px] font-medium bg-blush text-latte rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-blush-border/50">
        {room.focusTime && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-latte">⏱️ Focus</span>
            <span className="text-sm font-semibold font-mono text-mocha">{room.focusTime}</span>
          </div>
        )}
        {room.nowPlaying && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-mocha truncate max-w-[120px]">{room.nowPlaying}</span>
            <div className="flex items-center gap-[2px] ml-1">
              {[1, 2, 3, 4].map(i => <div key={i} className="eq-bar w-[2px] h-2 text-terracotta/60" />)}
            </div>
          </div>
        )}
        <span className="text-xs text-terracotta font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Tham gia →
        </span>
      </div>
    </button>
  )
}

export default function RoomGrid({ type, rooms = [], loading = false }) {
  const [activeRoom, setActiveRoom] = useState(null)

  const info = {
    study: { title: '📚 Học cùng nhau', desc: 'Chọn phòng học, bật pomodoro, và cùng nhau tập trung. Có nhau thì học dễ hơn!', emoji: '☕' },
    music: { title: '🎵 Nghe nhạc cùng nhau', desc: 'Tạo hoặc tham gia phòng nghe nhạc YouTube đồng bộ. Cùng chill cùng vibe!', emoji: '🎧' },
    watch: { title: '📱 Xem cùng nhau', desc: 'Video, shorts cùng xem — cười mới đã!', emoji: '🍿' },
  }

  if (activeRoom) {
    const back = () => setActiveRoom(null)
    switch (activeRoom.type) {
      case 'study': return <StudyRoom room={activeRoom} onBack={back} />
      case 'music': return <MusicRoom room={activeRoom} onBack={back} />
      case 'watch': return <WatchRoom room={activeRoom} onBack={back} />
      default: return null
    }
  }

  const i = info[type]

  return (
    <section id={`section-${type}`} className="py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-4xl mb-3 block">{i.emoji}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-mocha mb-3">{i.title}</h2>
          <p className="text-latte max-w-lg mx-auto">{i.desc}</p>
        </div>

        {loading ? (
          <RoomGridSkeleton count={6} />
        ) : rooms.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🏗️</span>
            <p className="text-mocha font-semibold mb-1">Chưa có phòng nào</p>
            <p className="text-sm text-latte">Hãy là người đầu tiên tạo phòng nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onEnter={setActiveRoom} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
