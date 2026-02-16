import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { removeToken } from "../../helper/tokens";

export function Logout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    removeToken();

    setOpen(false);
    navigate("/login");
    toast.success("Вы успешно вышли");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hover:bg-red-800/80 px-3 py-2 rounded-lg cursor-pointer border border-red-800 bg-red-800/30 transition-all"
      >
        <LogOut size={18} color="rgb(250,100,100)" />
      </button>

      {open && (
        <div className="bg-gray-800 p-3 rounded-lg absolute bottom-0 right-0 transform translate-y-full text-gray-100">
          <p className="font-light text-sm mb-2">
            Вы уверены, что хотите выйти?
          </p>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm rounded-lg cursor-pointer bg-gray-700"
            >
              Отменить
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm rounded-lg cursor-pointer bg-red-500"
            >
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
