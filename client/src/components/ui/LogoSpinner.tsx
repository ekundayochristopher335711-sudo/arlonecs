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
        <linearGradient id="spinGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <polygon
        points="50,6 88,27 88,73 50,94 12,73 12,27"
        fill="none"
        stroke="url(#spinGrad)"
        strokeWidth="9"
        strokeLinejoin="round"
        strokeDasharray="240"
        strokeDashoffset="60"
      />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          {/* Spinning gradient ring */}
          <svg width="56" height="56" viewBox="0 0 100 100" className="animate-spin absolute inset-0" style={{ animationDuration: '1.2s' }}>
            <defs>
              <linearGradient id="loaderGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="55%" stopColor="#5EEAD4" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
            <polygon
              points="50,6 88,27 88,73 50,94 12,73 12,27"
              fill="none"
              stroke="url(#loaderGrad)"
              strokeWidth="9"
              strokeLinejoin="round"
              strokeDasharray="240"
              strokeDashoffset="80"
            />
          </svg>
          {/* Static A monogram at the centre */}
          <svg width="56" height="56" viewBox="0 0 100 100" className="absolute inset-0">
            <path d="M50 32 L63 68" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
            <path d="M50 32 L37 68" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
            <path d="M42.5 57 L57.5 57" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-base">Arlonecs Project Controls</p>
          <p className="text-slate-500 text-xs mt-1">Loading…</p>
        </div>
      </div>
    </div>
  )
}
