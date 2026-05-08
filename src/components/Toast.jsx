import { useState, useCallback, useRef } from 'react'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})
  const remove = useCallback((id) => { setToasts(prev => prev.filter(t => t.id !== id)); clearTimeout(timers.current[id]); delete timers.current[id] }, [])
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => remove(id), duration)
    return id
  }, [remove])
  return { toasts, addToast, removeToast: remove }
}

const variants = {
  success: { icon: '✅', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  error: { icon: '❌', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-600' },
  info: { icon: '💡', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
  warning: { icon: '⚠️', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
}

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts?.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const v = variants[t.type] || variants.info
        return (
          <div key={t.id} className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-warm-md ${v.bg} anim-slide-in max-w-sm`}>
            <span className="text-lg shrink-0 mt-0.5">{v.icon}</span>
            <p className={`text-sm font-medium ${v.text} flex-1`}>{t.message}</p>
            <button onClick={() => onRemove(t.id)} className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer ${v.text}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
