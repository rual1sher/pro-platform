import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm" hideClose>
        <DialogHeader className="border-none pb-0">
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
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        {message && <DialogDescription className="mt-2">{message}</DialogDescription>}

        <DialogFooter className="border-none pt-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
