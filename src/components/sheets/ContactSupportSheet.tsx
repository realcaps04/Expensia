import { Headphones, Mail } from "lucide-react";
import { BottomSheet } from "./BottomSheet";

export const SUPPORT_EMAIL = "consoleprojectsonline@gmail.com";

type ContactSupportSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function ContactSupportSheet({ open, onClose }: ContactSupportSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Contact Us"
      elevated
      footer={
        <div className="flex flex-col gap-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-teal-brand py-3.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgba(20,184,166,0.28)] transition-transform active:scale-[0.98]"
          >
            <Mail className="h-4 w-4" strokeWidth={2.25} />
            Send email
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[16px] border border-surface-border py-3 text-[0.875rem] font-semibold text-ink-secondary transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center pb-2 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-brand/10 text-teal-deep">
          <Headphones className="h-7 w-7" strokeWidth={2} />
        </div>
        <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">
          Contact support at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-teal-deep break-all"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </BottomSheet>
  );
}
