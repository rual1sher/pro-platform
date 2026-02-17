import { LogOut, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { removeToken } from "../../helper/tokens";
import { Button } from "../../helper/button";

export function Logout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      ref.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      ref.current?.close();
      document.body.style.overflow = "auto";
    }
  }, [open]);

  const handleLogout = () => {
    removeToken();

    setOpen(false);
    navigate("/login");
    toast.success("Вы успешно вышли");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hover:bg-red-800/80 px-3 py-2 rounded-lg cursor-pointer border border-red-800 bg-red-800/30 transition-all"
      >
        <LogOut size={18} color="rgb(250,100,100)" />
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        className="bg-transparent p-0 border-0 outline-none max-w-none w-full h-full max-h-none m-0 overflow-hidden"
      >
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
          </div>

          <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/50 text-white w-full max-w-sm">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-3xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <LogOut className="w-10 h-10 text-red-400" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-center text-white mb-2">
                Выход из аккаунта
              </h2>

              <p className="text-gray-400 text-center text-sm leading-relaxed mb-8">
                Вы уверены, что хотите выйти?
                <br />
                Вам потребуется войти снова для доступа к аккаунту.
              </p>

              <div className="flex flex-col gap-3">
                <Button variant="danger" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                  Выйти
                </Button>

                <Button onClick={() => setOpen(false)}>
                  <X className="w-5 h-5" />
                  Отменить
                </Button>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
