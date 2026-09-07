import { Delete } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BottomSheet } from "../sheets/BottomSheet";

type Operator = "+" | "-" | "×" | "÷";

type CalculatorSheetProps = {
  open: boolean;
  onClose: () => void;
};

function formatDisplay(value: string) {
  if (value === "Error") return value;
  if (value === "" || value === "-") return value || "0";

  const negative = value.startsWith("-");
  const raw = negative ? value.slice(1) : value;
  const [intPart, fracPart] = raw.split(".");
  const formattedInt = Number(intPart || "0").toLocaleString("en-IN");
  const body =
    fracPart !== undefined ? `${formattedInt}.${fracPart}` : formattedInt;
  return negative ? `-${body}` : body;
}

function applyOp(left: number, right: number, op: Operator) {
  switch (op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? NaN : left / right;
  }
}

function trimResult(n: number) {
  if (!Number.isFinite(n)) return "Error";
  const rounded = Math.round(n * 1e10) / 1e10;
  const asString = String(rounded);
  if (asString.includes("e")) return rounded.toPrecision(10).replace(/\.?0+$/, "");
  return asString;
}

function Key({
  label,
  onClick,
  tone = "number",
  wide,
  ariaLabel,
}: {
  label: ReactNode;
  onClick: () => void;
  tone?: "number" | "op" | "accent" | "muted";
  wide?: boolean;
  ariaLabel?: string;
}) {
  const tones = {
    number:
      "bg-white text-ink shadow-[0_1px_3px_rgba(15,23,42,0.06)] active:bg-slate-50",
    op: "bg-[var(--bg-muted)] text-teal-brand active:bg-teal-brand/10",
    accent:
      "bg-gradient-to-b from-[#E87820] to-[#C45E12] text-white shadow-[0_8px_18px_rgba(232,120,32,0.28)] active:opacity-90",
    muted: "bg-[var(--bg-muted)] text-ink-secondary active:bg-slate-200/60 dark:active:bg-[#222]",
  } as const;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`flex h-14 items-center justify-center rounded-[16px] text-[1.25rem] font-semibold transition-transform active:scale-[0.97] ${
        wide ? "col-span-2" : ""
      } ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

export function CalculatorSheet({ open, onClose }: CalculatorSheetProps) {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [overwrite, setOverwrite] = useState(true);
  const [expression, setExpression] = useState("");

  const reset = useCallback(() => {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setOverwrite(true);
    setExpression("");
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const inputDigit = useCallback(
    (digit: string) => {
      setDisplay((current) => {
        if (current === "Error") return digit;
        if (overwrite || current === "0") return digit;
        if (current.replace("-", "").replace(".", "").length >= 12) return current;
        return `${current}${digit}`;
      });
      setOverwrite(false);
    },
    [overwrite],
  );

  const inputDot = useCallback(() => {
    setDisplay((current) => {
      if (current === "Error" || overwrite) return "0.";
      if (current.includes(".")) return current;
      return `${current}.`;
    });
    setOverwrite(false);
  }, [overwrite]);

  const backspace = useCallback(() => {
    setDisplay((current) => {
      if (overwrite || current === "Error") return "0";
      if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
        setOverwrite(true);
        return "0";
      }
      return current.slice(0, -1);
    });
  }, [overwrite]);

  const chooseOperator = useCallback(
    (next: Operator) => {
      const current = Number(display);
      if (display === "Error" || !Number.isFinite(current)) {
        reset();
        return;
      }

      if (stored !== null && operator && !overwrite) {
        const result = applyOp(stored, current, operator);
        const nextDisplay = trimResult(result);
        setDisplay(nextDisplay);
        setStored(nextDisplay === "Error" ? null : result);
        setExpression(nextDisplay === "Error" ? "" : `${nextDisplay} ${next}`);
        setOperator(nextDisplay === "Error" ? null : next);
        setOverwrite(true);
        return;
      }

      setStored(current);
      setOperator(next);
      setExpression(`${formatDisplay(display)} ${next}`);
      setOverwrite(true);
    },
    [display, operator, overwrite, reset, stored],
  );

  const equals = useCallback(() => {
    if (stored === null || !operator || display === "Error") return;
    const current = Number(display);
    if (!Number.isFinite(current)) {
      setDisplay("Error");
      setStored(null);
      setOperator(null);
      setExpression("");
      setOverwrite(true);
      return;
    }

    const result = applyOp(stored, current, operator);
    const nextDisplay = trimResult(result);
    setDisplay(nextDisplay);
    setExpression(
      nextDisplay === "Error"
        ? ""
        : `${formatDisplay(String(stored))} ${operator} ${formatDisplay(display)} =`,
    );
    setStored(null);
    setOperator(null);
    setOverwrite(true);
  }, [display, operator, stored]);

  const toggleSign = useCallback(() => {
    setDisplay((current) => {
      if (current === "0" || current === "Error") return current;
      return current.startsWith("-") ? current.slice(1) : `-${current}`;
    });
  }, []);

  const percent = useCallback(() => {
    setDisplay((current) => {
      const n = Number(current);
      if (!Number.isFinite(n)) return "Error";
      return trimResult(n / 100);
    });
    setOverwrite(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      if (key >= "0" && key <= "9") {
        event.preventDefault();
        inputDigit(key);
        return;
      }
      if (key === "." || key === ",") {
        event.preventDefault();
        inputDot();
        return;
      }
      if (key === "+" || key === "-") {
        event.preventDefault();
        chooseOperator(key);
        return;
      }
      if (key === "*" || key === "x" || key === "X") {
        event.preventDefault();
        chooseOperator("×");
        return;
      }
      if (key === "/") {
        event.preventDefault();
        chooseOperator("÷");
        return;
      }
      if (key === "Enter" || key === "=") {
        event.preventDefault();
        equals();
        return;
      }
      if (key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
      }
      if (key === "Escape") {
        event.preventDefault();
        reset();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, inputDigit, inputDot, chooseOperator, equals, backspace, reset]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Calculator">
      <div className="mx-auto w-full max-w-[340px] pb-2">
        <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <div className="mb-4 min-h-[4.5rem] rounded-[16px] bg-[var(--bg-muted)] px-4 py-3 text-right">
            <p className="min-h-[1.125rem] truncate text-[0.75rem] font-medium text-ink-muted">
              {expression || "\u00A0"}
            </p>
            <p className="mt-1 break-all font-display text-[2rem] font-bold leading-tight tracking-tight text-ink">
              {formatDisplay(display)}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <Key label="AC" tone="muted" onClick={reset} ariaLabel="Clear" />
            <Key label="±" tone="muted" onClick={toggleSign} ariaLabel="Toggle sign" />
            <Key label="%" tone="muted" onClick={percent} ariaLabel="Percent" />
            <Key label="÷" tone="op" onClick={() => chooseOperator("÷")} ariaLabel="Divide" />

            <Key label="7" onClick={() => inputDigit("7")} />
            <Key label="8" onClick={() => inputDigit("8")} />
            <Key label="9" onClick={() => inputDigit("9")} />
            <Key label="×" tone="op" onClick={() => chooseOperator("×")} ariaLabel="Multiply" />

            <Key label="4" onClick={() => inputDigit("4")} />
            <Key label="5" onClick={() => inputDigit("5")} />
            <Key label="6" onClick={() => inputDigit("6")} />
            <Key label="−" tone="op" onClick={() => chooseOperator("-")} ariaLabel="Subtract" />

            <Key label="1" onClick={() => inputDigit("1")} />
            <Key label="2" onClick={() => inputDigit("2")} />
            <Key label="3" onClick={() => inputDigit("3")} />
            <Key label="+" tone="op" onClick={() => chooseOperator("+")} ariaLabel="Add" />

            <Key
              label={<Delete className="h-5 w-5" strokeWidth={2} />}
              tone="muted"
              onClick={backspace}
              ariaLabel="Backspace"
            />
            <Key label="0" onClick={() => inputDigit("0")} />
            <Key label="." onClick={inputDot} ariaLabel="Decimal" />
            <Key label="=" tone="accent" onClick={equals} ariaLabel="Equals" />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
