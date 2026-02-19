export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
