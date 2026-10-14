import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] w-full max-w-sm p-6 shadow-2xl space-y-4 text-[#E3E3E3]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                variant === "danger"
                  ? "bg-[#CF6679]/15 text-[#CF6679]"
                  : "bg-[#BB86FC]/15 text-[#BB86FC]"
              }`}
            >
              <AlertTriangle size={18} />
            </div>
            <h2 className="text-base font-extrabold text-[#E3E3E3] leading-snug">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9E9E9E] hover:text-[#E3E3E3] rounded-full hover:bg-[#252525] transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {message && (
          <p className="text-xs text-[#9E9E9E] leading-relaxed font-medium">
            {message}
          </p>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Подождите..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
