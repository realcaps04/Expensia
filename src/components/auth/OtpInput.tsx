import { useEffect, useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  useEffect(() => {
    inputsRef.current[Math.min(value.length, 5)]?.focus();
  }, [value.length]);

  const updateDigit = (index: number, nextChar: string) => {
    const chars = digits.slice();
    chars[index] = nextChar;
    onChange(chars.join("").replace(/\D/g, "").slice(0, 6));
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      updateDigit(index, "");
      return;
    }

    if (cleaned.length > 1) {
      const merged = `${value.slice(0, index)}${cleaned}`.replace(/\D/g, "").slice(0, 6);
      onChange(merged);
      return;
    }

    updateDigit(index, cleaned);
    if (index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={6}
          disabled={disabled}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event.key)}
          className="h-12 w-11 rounded-[12px] border border-surface-border bg-white text-center text-[1.125rem] font-semibold text-ink shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-teal-brand/40 focus:outline-none focus:ring-2 focus:ring-teal-brand/15 disabled:opacity-60"
        />
      ))}
    </div>
  );
}
