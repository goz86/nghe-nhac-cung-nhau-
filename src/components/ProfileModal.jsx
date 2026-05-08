import { useState, useRef } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const INTERESTS = ['TOEIC', 'TOPIK', 'Lập trình', 'Tiếng Anh', 'Tiếng Hàn', 'Vẽ', 'Sách', 'Toán', 'Âm nhạc', 'Nhiếp ảnh', 'Nấu ăn', 'Du lịch', 'Thể thao', 'Game', 'Phim ảnh']

export default function ProfileModal({ onClose }) {
  const { user, profile, updateProfile } = useAuth()
  const inputRef = useRef(null)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [school, setSchool] = useState(profile?.school || '')
  const [interests, setInterests] = useState(profile?.interests || [])
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const toggle = (i) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Ảnh phải nhỏ hơn 2MB 📸'); return }
    setIsUploading(true); setError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(publicUrl)
      await updateProfile({ avatar_url: publicUrl })
    } catch (err) { setError(err.message || 'Upload thất bại') }
    finally { setIsUploading(false) }
  }

  const handleSave = async () => {
    setError(''); setIsSaving(true)
    try {
      await updateProfile({ full_name: fullName.trim(), bio: bio.trim(), school: school.trim(), interests, avatar_url: avatarUrl || undefined })
      setSaved(true); setTimeout(() => onClose(), 1200)
    } catch (err) { setError(err.message) }
    finally { setIsSaving(false) }
  }

  const initials = avatarUrl ? null : (profile?.full_name?.split(' ').pop().charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?')

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-warm-xl anim-scale-in overflow-y-auto max-h-[90vh]">
        <div className="h-2 bg-gradient-to-r from-terracotta via-rose-300 to-amber-200" />
        <button onClick={onClose} className="absolute top-6 right-5 w-8 h-8 rounded-full bg-cream hover:bg-blush flex items-center justify-center cursor-pointer z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-blush shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-terracotta to-rose-400 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-md">{initials}</div>
              )}
              <button onClick={() => inputRef.current?.click()} disabled={isUploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-blush-border shadow-sm flex items-center justify-center text-terracotta hover:bg-cream transition-all active:scale-95 cursor-pointer">
                {isUploading ? <span className="w-3 h-3 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" /> : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
              <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>
            <h2 className="text-xl font-bold text-mocha">Trang cá nhân</h2>
            <p className="text-sm text-latte mt-0.5">{user?.email}</p>
            <p className="text-xs text-latte mt-1">⭐ {profile?.streak || 0} ngày streak · ⏱️ {Math.floor((profile?.total_focus_minutes || 0) / 60)}h focus</p>
          </div>

          {saved ? (
            <div className="text-center py-8"><span className="text-4xl mb-3 block">✅</span><p className="text-mocha font-semibold">Đã lưu!</p></div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Tên', val: fullName, set: setFullName, placeholder: 'Nguyễn Văn A' },
                { label: 'Trường', val: school, set: setSchool, placeholder: 'Đại học Seoul' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-sm font-medium text-mocha mb-1.5 block">{f.label}</label>
                  <input type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-mocha mb-1.5 block">Giới thiệu</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Hãy giới thiệu đôi chút..." rows={2} maxLength={200}
                  className="w-full px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-mocha mb-2 block">Sở thích</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(i => (
                    <button key={i} onClick={() => toggle(i)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${interests.includes(i) ? 'bg-terracotta text-white border-terracotta shadow-sm' : 'bg-cream text-latte border-blush-border hover:text-mocha'}`}>
                      {interests.includes(i) ? '✓ ' : ''}{i}
                    </button>
                  ))}
                </div>
              </div>
              {error && <div className="px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-500">😅 {error}</div>}
              <button onClick={handleSave} disabled={isSaving}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white bg-terracotta hover:bg-terracotta-dark shadow-[0_4px_10px_rgba(182,129,118,0.3)] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
                {isSaving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</> : '💾 Lưu'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
