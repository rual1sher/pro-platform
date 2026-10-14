import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../store/auth.store";
import { Building2, ChevronDown, Plus, Users, Check } from "lucide-react";

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
      <button
        onClick={onOpenCreateOrg}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#BB86FC] text-[#121212] hover:bg-[#a871ea] text-xs font-bold transition-all shadow-xs"
      >
        <Plus size={15} />
        <span>Создать орг</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#252525] border border-[#2C2C2C] hover:border-[#BB86FC] text-[#E3E3E3] transition-all text-xs group"
        >
          <div className="w-5 h-5 rounded-lg bg-[#BB86FC] text-[#121212] flex items-center justify-center font-bold text-xs">
            <Building2 size={12} />
          </div>
          <div className="text-left max-w-[130px] truncate">
            <p className="font-bold text-xs leading-none text-[#E3E3E3] truncate">
              {activeOrg?.name || "Организация"}
            </p>
          </div>
          <ChevronDown
            size={13}
            className={`text-[#9E9E9E] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <button
          onClick={onOpenMembers}
          title="Сотрудники организации"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-[#252525] border border-[#2C2C2C] hover:border-[#BB86FC] text-[#03DAC6] hover:bg-[#1E1E1E] transition-all text-xs font-bold"
        >
          <Users size={13} />
          <span className="hidden sm:inline">Команда</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-[#1E1E1E] border border-[#2C2C2C] rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 text-[#E3E3E3]">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#9E9E9E] border-b border-[#2C2C2C]">
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-[#BB86FC]/15 text-[#BB86FC] font-black"
                      : "text-[#E3E3E3] hover:bg-[#252525]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Building2 size={13} className="text-[#03DAC6]" />
                    <span className="truncate">{org.name}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-[#BB86FC] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#2C2C2C] mt-1 pt-1 px-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCreateOrg();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#BB86FC] hover:bg-[#252525] rounded-xl transition-colors font-bold"
            >
              <Plus size={14} />
              <span>Создать организацию</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
