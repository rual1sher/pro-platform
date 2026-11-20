import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../store/auth.store";
import { Building2, ChevronDown, Plus, Users, Check } from "lucide-react";
import { Button } from "../ui/button";

interface OrgSwitcherProps {
  onOpenCreateOrg: () => void;
  onOpenMembers: () => void;
}

export function OrgSwitcher({ onOpenCreateOrg, onOpenMembers }: OrgSwitcherProps) {
  const { organizations, activeOrg, setActiveOrgById } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeOrg && organizations.length === 0) {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={onOpenCreateOrg}
        className="rounded-xl"
      >
        <Plus size={15} />
        <span>Создать орг</span>
      </Button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        <Button
          variant="dark"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-2xl hover:border-[var(--brand-primary)] text-[var(--text-primary)] text-xs font-normal"
        >
          <div className="w-5 h-5 rounded-lg bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center font-bold text-xs">
            <Building2 size={12} />
          </div>
          <div className="text-left max-w-[130px] truncate">
            <p className="font-bold text-xs leading-none text-[var(--text-primary)] truncate">
              {activeOrg?.name || "Организация"}
            </p>
          </div>
          <ChevronDown
            size={13}
            className={`text-[var(--text-secondary)] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>

        <Button
          variant="dark"
          size="sm"
          onClick={onOpenMembers}
          title="Сотрудники организации"
          className="rounded-2xl hover:border-[var(--brand-primary)] text-[var(--brand-secondary)] hover:bg-[var(--bg-surface)] text-xs font-bold"
        >
          <Users size={13} />
          <span className="hidden sm:inline">Команда</span>
        </Button>
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 text-[var(--text-primary)]">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-light)]">
            Мои организации
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {organizations.map((org) => {
              const isSelected = org.id === activeOrg?.id;
              return (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrgById(org.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-black"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Building2 size={13} className="text-[var(--brand-secondary)]" />
                    <span className="truncate">{org.name}</span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-[var(--brand-primary)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-[var(--border-light)] mt-1 pt-1 px-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateOrg();
              }}
              className="w-full justify-start text-[var(--brand-primary)] hover:bg-[var(--bg-overlay)] rounded-xl font-bold h-auto py-1.5"
            >
              <Plus size={14} />
              <span>Создать организацию</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
