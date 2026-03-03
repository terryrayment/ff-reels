"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-[12px] text-[#888] font-medium">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white/80 border border-[#E8E7E3]/80 rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#ccc]",
            "focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/8 focus:border-[#1A1A1A]/15",
            "transition-all duration-200",
            error && "border-red-300 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-[12px] text-[#888] font-medium">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white/80 border border-[#E8E7E3]/80 rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#ccc]",
            "focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/8 focus:border-[#1A1A1A]/15",
            "transition-all duration-200 resize-none",
            error && "border-red-300 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-[12px] text-[#888] font-medium">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white/80 border border-[#E8E7E3]/80 rounded-lg text-[13px] text-[#1A1A1A]",
            "focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/8 focus:border-[#1A1A1A]/15",
            "transition-all duration-200",
            error && "border-red-300 focus:ring-red-500/20",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
