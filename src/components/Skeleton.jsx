export function RoomCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-blush-border bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blush anim-shimmer" />
          <div className="space-y-2">
            <div className="w-32 h-4 rounded-full bg-blush anim-shimmer" />
            <div className="w-20 h-3 rounded-full bg-blush anim-shimmer" />
          </div>
        </div>
        <div className="w-12 h-4 rounded-full bg-blush anim-shimmer" />
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="w-full h-3 rounded-full bg-blush anim-shimmer" />
        <div className="w-3/4 h-3 rounded-full bg-blush anim-shimmer" />
      </div>
      <div className="flex gap-1.5 mb-4">
        {[1, 2, 3].map(i => <div key={i} className="w-14 h-5 rounded-full bg-blush anim-shimmer" />)}
      </div>
      <div className="pt-2 border-t border-blush-border/50">
        <div className="w-24 h-4 rounded-full bg-blush anim-shimmer" />
      </div>
    </div>
  )
}

export function RoomGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => <RoomCardSkeleton key={i} />)}
    </div>
  )
}
