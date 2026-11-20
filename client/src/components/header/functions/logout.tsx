import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { removeToken } from "../../helper/tokens";
import { useAuth } from "../../../store/auth.store";
import { Button } from "../../ui/button";
import { ConfirmModal } from "../../helper/confirm-modal";

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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        title="Выйти"
        className="w-8 h-8 p-0 rounded-lg text-[var(--text-secondary)] hover:text-[var(--status-error)] hover:bg-[var(--bg-overlay)]"
      >
        <LogOut size={16} />
      </Button>

      <ConfirmModal
        isOpen={open}
        title="Выход из аккаунта"
        message="Вы уверены, что хотите выйти из рабочей среды?"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        variant="danger"
        onConfirm={handleLogout}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
