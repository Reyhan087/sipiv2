"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/cn";

interface PinInputProps {
  length?: number;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function PinInput({ length = 6, onComplete, disabled, error }: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setValues(Array(length).fill(""));
  }, [disabled, length]);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = useCallback((index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);

    if (digit === "" && raw === "") {
      const next = [...values];
      next[index] = "";
      setValues(next);
      return;
    }

    if (!/^\d$/.test(digit)) return;

    const next = [...values];
    next[index] = digit;
    setValues(next);

    if (index < length - 1) {
      focusInput(index + 1);
    }

    if (next.every((v) => v !== "")) {
      onComplete?.(next.join(""));
    }
  }, [values, length, onComplete, focusInput]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...values];
      if (values[index]) {
        next[index] = "";
        setValues(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setValues(next);
        focusInput(index - 1);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  }, [values, length, focusInput]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = Array(length).fill("") as string[];
    for (let i = 0; i < pasted.length && i < length; i++) {
      next[i] = pasted[i];
    }
    setValues(next);

    const nextIndex = Math.min(pasted.length, length - 1);
    focusInput(nextIndex);

    if (next.every((v) => v !== "")) {
      onComplete?.(next.join(""));
    }
  }, [length, onComplete, focusInput]);

  return (
    <div className="flex justify-center gap-2">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-12 rounded-md border bg-surface text-center text-price-lg font-mono outline-none transition-shadow duration-fast",
            value
              ? error
                ? "border-danger shadow-[0_0_0_3px_var(--color-danger-bg)]"
                : "border-primary shadow-[0_0_0_3px_var(--color-primary-light)]"
              : "border-border-strong",
            "focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
