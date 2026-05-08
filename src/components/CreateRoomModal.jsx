import { useState } from 'react'
import { useAuth } from '../lib/auth'

const ROOM_TYPES = [
  { id: 'study', label: '📚 Học cùng', desc: 'Pomodoro, focus timer, chat' },
  { id: 'music', label: '🎵 Nghe cùng', desc: 'Nghe nhạc đồng bộ, queue, vote' },
  { id: 'watch', label: '📱 Xem cùng', desc: 'Xem video/shorts cùng nhau' },
]

const PRESET_TAGS = {
  study: ['TOEIC', 'TOPIK', 'Lập trình', 'Tiếng Anh', 'Tiếng Hàn', 'Toán', 'Vẽ', 'Sách', 'Ôn thi', 'Đại học'],
  music: ['V-Pop', 'K-Pop', 'Lofi', 'Indie', 'EDM', 'Ballad', 'Nhạc Việt', 'Chill', 'Sôi động'],
  watch: ['TikTok', 'YouTube', 'Shorts', 'Hài hước', 'Review', 'Phim', 'Giải trí', 'Âm nhạc'],
}

export default function CreateRoomModal({ onClose, onCreated, createRoom }) {
  const { user } = useAuth()
  const [step, setStep] = useState('type')
  const [roomType, setRoomType] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [desc, setDesc] = useState('')
  const [maxMembers, setMaxMembers] = useState(10)
  const [selectedTags, setSelectedTags] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (tag) => setSelectedTags(prev =>
    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
  )

  const handleCreate = async () => {
    setError('')
    if (!user) { setError('Cần đăng nhập để tạo phòng 🔑'); return }
    if (!roomName.trim()) { setError('Nhập tên phòng bạn ơi 📝'); return }
    if (selectedTags.length === 0) { setError('Chọn ít nhất 1 tag 🔖'); return }

    setIsCreating(true)
    try {
      const newRoom = await createRoom({
        name: roomName.trim(), type: roomType.id, description: desc.trim(),
        tags: selectedTags, maxMembers,
      })
      onCreated(newRoom)
    } catch (err) { setError(err.message || 'Có lỗi xảy ra 😅') }
    finally { setIsCreating(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-warm-xl anim-scale-in">
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream hover:bg-blush flex items-center justify-center text-latte hover:text-mocha transition-all cursor-pointer z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'type' ? (
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="text-3xl mb-2 block">🏗️</span>
              <h2 className="text-xl font-bold text-mocha">Tạo phòng mới</h2>
              <p className="text-sm text-latte mt-1">Chọn loại phòng</p>
            </div>
            <div className="space-y-3">
              {ROOM_TYPES.map(type => (
                <button key={type.id} onClick={() => { setRoomType(type); setStep('form') }}
                  className="w-full text-left p-4 rounded-2xl border border-blush-border hover:border-terracotta/30 hover:bg-blush/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.label.split(' ')[0]}</span>
                    <div>
                      <div className="font-semibold text-mocha text-sm group-hover:text-terracotta transition-colors">{type.label}</div>
                      <div className="text-xs text-latte mt-0.5">{type.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('type')}
                className="w-8 h-8 rounded-full bg-cream hover:bg-blush flex items-center justify-center text-latte hover:text-mocha transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-latte">→</span>
                <span className="w-6 h-6 rounded-full bg-blush text-terracotta flex items-center justify-center text-xs font-bold">2</span>
              </div>
            </div>

            <span className="text-2xl mb-2 block">{roomType.label.split(' ')[0]}</span>
            <h2 className="text-xl font-bold text-mocha mb-6">Chi tiết phòng</h2>

            <div className="mb-4">
              <label className="text-sm font-medium text-mocha mb-1.5 block">Tên phòng <span className="text-rose-400">*</span></label>
              <input type="text" value={roomName} onChange={e => setRoomName(e.target.value)}
                placeholder="VD: TOEIC 900 Cùng Nhau" maxLength={40}
                className="w-full px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte" />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-mocha mb-1.5 block">Mô tả</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Phòng này để làm gì?" rows={2} maxLength={120}
                className="w-full px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte resize-none" />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-mocha mb-1.5 block">Sĩ số: <span className="text-terracotta font-bold">{maxMembers}</span></label>
              <input type="range" min="2" max="30" value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))}
                className="w-full h-1.5 appearance-none bg-blush rounded-full cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-terracotta" />
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-mocha mb-2 block">Tags <span className="text-rose-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS[roomType.id]?.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-terracotta text-white border-terracotta shadow-sm'
                        : 'bg-cream text-latte border-blush-border hover:text-mocha'
                    }`}>
                    {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="mb-4 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-500">😅 {error}</div>}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-medium text-latte border border-blush-border hover:bg-cream transition-all cursor-pointer">Huỷ</button>
              <button onClick={handleCreate} disabled={isCreating}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-terracotta hover:bg-terracotta-dark shadow-[0_4px_10px_rgba(182,129,118,0.3)] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
                {isCreating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo...</> : '🚀 Tạo phòng'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
