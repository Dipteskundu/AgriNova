import React, { useEffect } from "react";
import { tr } from "@/lib/localize";
import { X } from "@/components/icons";

interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const widthStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

export const Modal: React.FC<ModalProps> = ({
  id,
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "lg",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-xs dark:backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`w-full ${widthStyles[maxWidth]} bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] dark:bg-[#0a0a0a] dark:border-[#222222] dark-glow-strong`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 dark:border-[#1a1a1a] dark:bg-[#111111]/60">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f0f0f0] truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5 line-clamp-2">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-[#666666] hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] dark:hover:text-[#f0f0f0] rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label={tr('Close dialog')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
