import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { useFriends, useUserSearch } from '../lib/useRooms'

export default function FriendsModal({ onClose, addToast }) {
  const { user } = useAuth()
  const { friends, requests, loading, acceptRequest, declineRequest, sendFriendRequest } = useFriends()
  const { results: discover, loading: discoverLoading, searchUsers } = useUserSearch()
  const [tab, setTab] = useState('friends')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { if (tab === 'discover') searchUsers('') }, [tab])

  const handleSearch = async () => {
    if (!search.trim()) return; setSending(true); setResult(null)
    try {
      const { supabase } = await import('../lib/supabase')
      const { data } = await supabase.from('profiles').select('id, full_name, username, school, interests').ilike('full_name', `%${search.trim()}%`).limit(5)
      if (!data || data.length === 0) setResult({ type: 'none' })
      else { const f = data.filter(p => p.id !== user?.id); if (f.length === 0) setResult({ type: 'self' }); else setResult({ type: 'results', users: f }) }
    } catch { setResult({ type: 'none' }) }
    finally { setSending(false) }
  }

  const send = async (id) => { try { await sendFriendRequest(id); addToast?.('✅ Đã gửi lời mời!', 'success'); setResult(null); setSearch('') } catch (err) { addToast?.(err.message, 'error') } }

  const Tabs = [
    { id: 'friends', label: `👥 Bạn bè (${friends.length})` },
    { id: 'requests', label: `📨 Mời (${requests.length})` },
    { id: 'discover', label: '🌍 Khám phá' },
    { id: 'add', label: '➕ Thêm' },
  ]

  const UserRow = ({ u, action }) => (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-cream transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-rose-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
        {u.full_name?.split(' ').pop().charAt(0).toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-mocha truncate">{u.full_name || u.username || 'User'}</p>
        <p className="text-xs text-latte truncate">{u.school || ''}{u.interests?.length > 0 && ` · ${u.interests.slice(0, 2).join(', ')}`}</p>
      </div>
      {action}
    </div>
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-warm-xl anim-scale-in overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-terracotta via-rose-300 to-amber-200" />
        <button onClick={onClose} className="absolute top-6 right-5 w-8 h-8 rounded-full bg-cream hover:bg-blush flex items-center justify-center cursor-pointer z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="pt-6 pb-4 px-6 sm:px-8">
          <h2 className="text-xl font-bold text-mocha text-center mb-5">🤝 Bạn bè</h2>
          <div className="flex gap-2 mb-5 bg-cream rounded-2xl p-1">
            {Tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${tab === t.id ? 'bg-white text-terracotta shadow-sm' : 'text-latte hover:text-mocha'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar -mx-6 sm:-mx-8 px-6 sm:px-8">
            {loading ? (
              <div className="text-center py-12"><span className="w-6 h-6 border-2 border-blush-border border-t-terracotta rounded-full animate-spin inline-block" /></div>
            ) : tab === 'friends' ? (
              friends.length === 0 ? <div className="text-center py-12"><span className="text-4xl mb-3 block">😢</span><p className="text-mocha font-semibold">Chưa có bạn bè</p></div> :
              <div className="space-y-1 pb-4">{friends.map((f, i) => <UserRow key={i} u={f} action={<span className="text-xs text-emerald-500 font-medium bg-emerald-50 px-2 py-1 rounded-full">🤝 Bạn bè</span>} />)}</div>
            ) : tab === 'requests' ? (
              requests.length === 0 ? <div className="text-center py-12"><span className="text-4xl mb-3 block">📭</span><p className="text-mocha font-semibold">Không có lời mời</p></div> :
              <div className="space-y-1 pb-4">{requests.map(req => (
                <UserRow key={req.id} u={req.requester} action={<div className="flex gap-1.5">
                  <button onClick={() => acceptRequest(req.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-terracotta rounded-xl hover:bg-terracotta-dark active:scale-95 transition-all cursor-pointer">✅ Chấp nhận</button>
                  <button onClick={() => declineRequest(req.id)} className="px-3 py-1.5 text-xs font-medium text-latte border border-blush-border rounded-xl hover:bg-cream active:scale-95 transition-all cursor-pointer">Từ chối</button>
                </div>} />
              ))}</div>
            ) : tab === 'discover' ? (
              <div className="pb-4">
                <input type="text" onChange={e => searchUsers(e.target.value)} placeholder="Tìm kiếm..."
                  className="w-full px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte mb-3" />
                {discoverLoading ? <div className="text-center py-8"><span className="w-5 h-5 border-2 border-blush-border border-t-terracotta rounded-full animate-spin inline-block" /></div> :
                discover.length === 0 ? <div className="text-center py-8"><span className="text-3xl mb-2 block">🔍</span><p className="text-sm text-latte">Chưa có người dùng</p></div> :
                <div className="space-y-1">{discover.map(u => <UserRow key={u.id} u={u} action={<button onClick={() => send(u.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-terracotta rounded-xl hover:bg-terracotta-dark active:scale-95 transition-all cursor-pointer">🤝 Kết bạn</button>} />)}</div>}
              </div>
            ) : (
              <div className="pb-4">
                <div className="flex gap-2 mb-4">
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Tìm kiếm bạn..."
                    className="flex-1 px-4 py-2.5 bg-cream rounded-2xl border border-blush-border focus:outline-none focus:border-terracotta/30 focus:bg-white transition-colors text-sm text-mocha placeholder:text-latte" />
                  <button onClick={handleSearch} disabled={sending} className="px-4 py-2.5 bg-terracotta text-white rounded-2xl text-sm font-medium hover:bg-terracotta-dark active:scale-95 transition-all disabled:opacity-60 cursor-pointer">{sending ? '...' : '🔍 Tìm'}</button>
                </div>
                {result?.type === 'none' && <div className="text-center py-6"><span className="text-3xl mb-2 block">🔍</span><p className="text-sm text-latte">Không tìm thấy</p></div>}
                {result?.type === 'self' && <div className="text-center py-6"><span className="text-3xl mb-2 block">😅</span><p className="text-sm text-latte">Đó là bạn!</p></div>}
                {result?.type === 'results' && <div className="space-y-1">{result.users.map(u => <UserRow key={u.id} u={u} action={<button onClick={() => send(u.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-terracotta rounded-xl hover:bg-terracotta-dark active:scale-95 transition-all cursor-pointer">🤝 Kết bạn</button>} />)}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
