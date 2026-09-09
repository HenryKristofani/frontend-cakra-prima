"use client";

import React, { useRef } from "react";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string | number | undefined | null;
  onChange: (numericStr: string) => void;
}

/**
 * Formats a numeric value or numeric string with Indonesian thousands separators (dots).
 * E.g. "1500000" -> "1.500.000"
 * Returns "" if empty or 0.
 */
export function formatCurrencyWithDots(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === "" || val === 0 || val === "0") return "";
  const digits = String(val).replace(/\D/g, "").replace(/^0+(?!$)/, "");
  if (!digits || digits === "0") return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Strips all dots and non-digits from a string, removing leading zeroes.
 */
export function stripCurrencyDots(formatted: string): string {
  const digits = formatted.replace(/\D/g, "").replace(/^0+(?!$)/, "");
  return digits === "0" ? "" : digits;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, className, onKeyDown, ...rest }, forwardedRef) {
    const internalRef = useRef<HTMLInputElement | null>(null);

    const setRef = (node: HTMLInputElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    const displayValue = formatCurrencyWithDots(value);

    const restoreCursor = (targetDigitsLeft: number, formatted: string) => {
      let newPos = 0;
      let digitsSeen = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) digitsSeen++;
        if (digitsSeen === targetDigitsLeft) {
          newPos = i + 1;
          break;
        }
      }
      if (targetDigitsLeft === 0) newPos = 0;

      requestAnimationFrame(() => {
        if (internalRef.current) {
          internalRef.current.setSelectionRange(newPos, newPos);
        }
      });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const selectionEnd = input.selectionEnd ?? input.value.length;
      const targetDigitsLeft = (input.value.slice(0, selectionEnd).match(/\d/g) || []).length;

      const raw = stripCurrencyDots(input.value);
      const formatted = formatCurrencyWithDots(raw);

      restoreCursor(targetDigitsLeft, formatted);
      onChange(raw);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onKeyDown) onKeyDown(e);
      if (e.defaultPrevented) return;

      const input = internalRef.current;
      if (!input) return;

      // When cursor is directly after a dot separator, Backspace deletes the digit before the dot
      if (
        e.key === "Backspace" &&
        input.selectionStart === input.selectionEnd &&
        input.selectionStart !== null
      ) {
        const pos = input.selectionStart;
        if (pos > 1 && input.value[pos - 1] === ".") {
          e.preventDefault();
          const currentVal = input.value;
          const newVal = currentVal.slice(0, pos - 2) + currentVal.slice(pos - 1);
          const targetDigitsLeft = (newVal.slice(0, pos - 2).match(/\d/g) || []).length;
          const raw = stripCurrencyDots(newVal);
          const formatted = formatCurrencyWithDots(raw);

          restoreCursor(targetDigitsLeft, formatted);
          onChange(raw);
        }
      }
    };

    return (
      <input
        ref={setRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={className}
        {...rest}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
