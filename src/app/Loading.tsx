export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-space px-6">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="hex-frame absolute inset-0 animate-spin-slow border-2 border-signal-violet/50" />
        <span className="hex-frame absolute inset-2 bg-space-panel" />
        <span className="relative h-3 w-3 animate-pulse rounded-full bg-signal-cyan" />
      </div>

      <div className="w-full max-w-xs space-y-3">
        <div className="h-3 w-2/3 mx-auto animate-pulse rounded-full bg-space-panel" />
        <div className="h-3 w-1/2 mx-auto animate-pulse rounded-full bg-space-panel" />
      </div>
    </div>
  );
}