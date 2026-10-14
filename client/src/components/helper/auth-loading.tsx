export function AuthLoading() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-[#121212] text-[#E3E3E3]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-[#BB86FC] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[#E3E3E3] font-extrabold text-xs">Загрузка платформы...</span>
      </div>
    </div>
  );
}
