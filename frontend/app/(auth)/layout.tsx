export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/mountain-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Gradient fallback when image is not available */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0F0F0F] via-[#1a1a2e] to-[#0F0F0F]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-gold text-4xl font-bold tracking-tight">batchNews</h1>
          <p className="mt-2 text-sm text-white/60">Multi-account X content automation</p>
        </div>
        {children}
      </div>
    </div>
  );
}
