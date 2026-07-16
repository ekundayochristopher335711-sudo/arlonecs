export default function LogoSpinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="animate-spin"
      style={{ animationDuration: '1s' }}
    >
      <defs>
        <linearGradient id="spinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <circle
        cx="50" cy="50" r="40"
        fill="none"
        stroke="url(#spinGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="180 72"
      />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-16 h-16">
          {/* Spinning gold-to-blue ring */}
          <svg width="64" height="64" viewBox="0 0 100 100" className="animate-spin absolute inset-0" style={{ animationDuration: '1.2s' }}>
            <defs>
              <linearGradient id="loaderGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="55%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#loaderGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="200 76" />
          </svg>
          {/* Static mark: blue bars + gold arrow */}
          <svg width="64" height="64" viewBox="0 0 100 100" className="absolute inset-0 p-3">
            <rect x="22" y="52" width="12" height="28" rx="3" fill="#3B82F6" opacity="0.9" />
            <rect x="40" y="38" width="12" height="42" rx="3" fill="#60A5FA" opacity="0.9" />
            <polygon points="68,16 82,50 73,50 68,35 63,50 54,50" fill="#FBBF24" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-base">Aurum Project Controls</p>
          <p className="text-slate-500 text-xs mt-1">Loading…</p>
        </div>
      </div>
    </div>
  )
}
