import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { removeToken } from "../../helper/tokens";
import { useAuth } from "../../../store/auth.store";

export function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    removeToken();
    logout();
    setOpen(false);
    navigate("/login");
    toast.info("Вы вышли из системы");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Выйти"
        className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-[#CF6679] hover:bg-[#252525] transition-colors"
      >
        <LogOut size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-3xl p-6 shadow-2xl max-w-xs w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#CF6679]/20 text-[#CF6679] flex items-center justify-center mx-auto">
              <LogOut size={22} />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#E3E3E3]">Выход из аккаунта</h3>
              <p className="text-xs text-[#9E9E9E] mt-1">
                Вы уверены, что хотите выйти из рабочей среды?
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#2C2C2C] font-bold text-xs text-[#E3E3E3] hover:bg-[#252525] transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-[#CF6679] hover:bg-[#b95164] font-bold text-xs text-[#121212] transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
