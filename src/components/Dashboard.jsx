import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (error && !error.message?.includes('does not exist')) console.error(error)
        if (data) setSessions(data)
        setLoading(false)
      })
  }, [user])

  const totalSessions = sessions.length
  const totalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration_seconds / 60), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remaining = totalMinutes % 60
  const streak = profile?.streak || 0

  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const dayMins = sessions.filter(s => s.completed_at?.startsWith(dateStr)).reduce((sum, s) => sum + Math.round(s.duration_seconds / 60), 0)
    return { label: date.toLocaleDateString('vi-VN', { weekday: 'short' }), minutes: dayMins }
  })
  const maxWeekly = Math.max(...weeklyData.map(d => d.minutes), 1)

  const StatCard = ({ label, value }) => (
    <div className="p-5 rounded-2xl border border-blush-border bg-white shadow-warm-sm">
      <p className="text-xs text-latte mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono text-mocha">{value}</p>
    </div>
  )

  return (
    <section className="pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-mocha mb-2">📊 Dashboard</h1>
          <p className="text-sm text-latte">Thống kê focus của bạn</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Số buổi focus" value={totalSessions} />
          <StatCard label="Tổng giờ" value={`${totalHours}h ${remaining}m`} />
          <StatCard label="Streak" value={`${streak} ngày`} />
          <StatCard label="Best" value={streak > 0 ? '🔥 On fire' : '—'} />
        </div>

        {/* Weekly chart */}
        <div className="p-6 rounded-2xl border border-blush-border bg-white shadow-warm-sm mb-6">
          <h3 className="text-sm font-semibold text-mocha mb-5">Tuần này</h3>
          <div className="flex items-end justify-between gap-3 h-32">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex items-end justify-center" style={{ height: `${Math.max((day.minutes / maxWeekly) * 100, 4)}%` }}>
                  {day.minutes > 0 && <div className="w-full rounded-t-md bg-terracotta transition-all duration-500" style={{ height: `${Math.max((day.minutes / maxWeekly) * 100, 4)}%` }} />}
                </div>
                <span className="text-[11px] text-latte">{day.label}</span>
                {day.minutes > 0 && <span className="text-[10px] font-mono text-latte -mt-1">{day.minutes}m</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <div className="p-6 rounded-2xl border border-blush-border bg-white shadow-warm-sm">
            <h3 className="text-sm font-semibold text-mocha mb-4">Gần đây</h3>
            <div className="space-y-2">
              {sessions.slice(0, 10).map((s, i) => (
                <div key={s.id || i} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-cream transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{s.duration_seconds >= 1500 ? '📚' : '☕'}</span>
                    <div>
                      <p className="text-sm text-mocha">{s.duration_seconds >= 1500 ? 'Focus' : 'Break'}</p>
                      <p className="text-xs text-latte">{Math.round(s.duration_seconds / 60)} phút</p>
                    </div>
                  </div>
                  <span className="text-xs text-latte font-mono">{s.completed_at ? new Date(s.completed_at).toLocaleDateString('vi-VN') : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!user && (
          <div className="text-center py-12 border border-dashed border-blush-border rounded-2xl">
            <span className="text-4xl mb-3 block">🔒</span>
            <p className="text-mocha font-semibold mb-1">Đăng nhập để xem thống kê</p>
          </div>
        )}
      </div>
    </section>
  )
}
