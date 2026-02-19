export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder — implemented in AUTH-004 */}
      <aside className="bg-card hidden w-64 flex-col border-r md:flex">
        <div className="border-b p-4 text-lg font-semibold">batchNews</div>
        <nav className="flex-1 p-4">{/* Navigation links — AUTH-004 */}</nav>
      </aside>
      <div className="flex flex-1 flex-col">
        {/* Header placeholder — implemented in AUTH-004 */}
        <header className="flex h-14 items-center border-b px-6">
          {/* Header content — AUTH-004 */}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
