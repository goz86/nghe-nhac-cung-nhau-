export default function Hero({ setActiveTab, onCreateRoom }) {
  const scrollTo = (id) => {
    setActiveTab(id)
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden bg-cream">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-rose-200/10 rounded-full blur-3xl" />
      </div>

      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-[15%] left-[10%] text-3xl anim-float" style={{ animationDelay: '0s' }}>📚</span>
        <span className="absolute top-[25%] right-[15%] text-2xl anim-float-slow" style={{ animationDelay: '0.3s' }}>🎵</span>
        <span className="absolute bottom-[30%] left-[8%] text-2xl anim-float" style={{ animationDelay: '0.6s' }}>☕</span>
        <span className="absolute top-[40%] right-[8%] text-3xl anim-float-fast" style={{ animationDelay: '0.9s' }}>🎮</span>
        <span className="absolute bottom-[20%] right-[20%] text-2xl anim-float-slow" style={{ animationDelay: '1.2s' }}>🌏</span>
        <span className="absolute bottom-[25%] left-[20%] text-xl anim-float" style={{ animationDelay: '1.5s' }}>💬</span>
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blush rounded-full mb-8 anim-stagger">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-terracotta">
            Dành cho du học sinh Việt tại Hàn
          </span>
        </div>

        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-mocha mb-6 anim-stagger anim-delay-1">
          Học tập & Kết bạn{' '}
          <span className="text-terracotta relative">
            cùng nhau
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
              <path d="M2 10C50 2 150 2 198 10" stroke="#B68176" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
            </svg>
          </span>
        </h1>

        <p className="text-lg text-latte leading-relaxed max-w-xl mx-auto mb-10 anim-stagger anim-delay-2">
          Không còn cô đơn nơi xứ người. Tạo phòng học, nghe nhạc, xem TikTok
          cùng những người bạn mới — ngay bây giờ!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 anim-stagger anim-delay-3">
          <button onClick={() => scrollTo('study')}
            className="px-8 py-3.5 bg-terracotta text-white font-semibold rounded-2xl shadow-[0_8px_20px_rgba(182,129,118,0.3)] hover:shadow-[0_8px_30px_rgba(182,129,118,0.4)] hover:bg-terracotta-dark active:scale-[0.98] transition-all duration-200 cursor-pointer">
            🚀 Bắt đầu ngay
          </button>
          <button onClick={onCreateRoom}
            className="px-8 py-3.5 border-2 border-terracotta/30 text-terracotta font-semibold rounded-2xl bg-blush/50 hover:bg-blush active:scale-[0.98] transition-all duration-200 cursor-pointer">
            ✨ Tạo phòng mới
          </button>
          <button onClick={() => scrollTo('study')}
            className="px-8 py-3.5 border-2 border-blush-border text-mocha font-semibold rounded-2xl hover:bg-blush active:scale-[0.98] transition-all duration-200 cursor-pointer">
            Khám phá phòng
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto anim-stagger anim-delay-4">
          {[
            { number: '12+', label: 'Phòng học', color: 'terracotta' },
            { number: '200+', label: 'Người dùng', color: 'mocha' },
            { number: '3', label: 'Loại phòng', color: 'terracotta' },
          ].map((stat, i) => (
            <div key={i}>
              <div className={`text-3xl sm:text-4xl font-bold font-mono ${
                stat.color === 'terracotta' ? 'text-terracotta' : 'text-mocha'
              }`}>
                {stat.number}
              </div>
              <div className="text-sm text-latte mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 anim-float">
        <svg className="w-6 h-6 text-latte" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
