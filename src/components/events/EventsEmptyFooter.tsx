import { ClipboardList, Plus, Sparkles } from "lucide-react";

type EventsEmptyFooterProps = {
  onCreate: () => void;
  variant?: "end-of-list" | "empty";
};

export function EventsEmptyFooter({ onCreate, variant = "end-of-list" }: EventsEmptyFooterProps) {
  const isEmpty = variant === "empty";

  return (
    <section className="flex flex-col items-center px-4 py-8 text-center">
      <div className="relative mb-5">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-teal-brand/10">
          <ClipboardList className="h-11 w-11 text-teal-brand/70" strokeWidth={1.5} />
        </div>
        <Sparkles
          className="absolute -right-1 top-0 h-5 w-5 text-teal-brand/40"
          strokeWidth={1.75}
        />
        <Sparkles
          className="absolute -left-2 bottom-2 h-4 w-4 text-teal-brand/30"
          strokeWidth={1.75}
        />
      </div>

      <h2 className="font-display text-[1.0625rem] font-bold text-ink">
        {isEmpty ? "No events yet" : "No more events"}
      </h2>
      <p className="mt-1.5 max-w-[240px] text-[0.8125rem] leading-relaxed text-ink-secondary">
        {isEmpty
          ? "Create your first event to group income, expenses, and credit."
          : "Create a new event to start tracking"}
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex w-full max-w-[280px] items-center justify-center gap-2 rounded-[16px] border-2 border-teal-brand bg-white py-3 text-[0.9375rem] font-semibold text-teal-brand transition-colors hover:bg-teal-brand/5 active:scale-[0.99] dark:bg-transparent dark:hover:bg-teal-brand/10"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Create New Event
      </button>
    </section>
  );
}
