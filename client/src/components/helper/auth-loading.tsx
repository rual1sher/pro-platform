export function AuthLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-[var(--text-primary)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[var(--text-primary)] font-extrabold text-xs">
          Загрузка платформы...
        </span>
      </div>
    </div>
  );
}
