import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        "bg-white border border-[#E8E8E3]",
        className
      )}
    >
      <div className="w-12 h-12 rounded-sm bg-[#F7F6F3] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#999]" />
      </div>
      <h3 className="text-sm font-semibold text-[#1A1A1A]">{title}</h3>
      <p className="text-sm text-[#999] mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
