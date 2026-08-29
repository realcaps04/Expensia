import { useQuery } from "convex/react";
import { CalendarRange, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { AddEventSheet, type EventRowData } from "../components/sheets/AddEventSheet";
import { useAuth } from "../context/AuthProvider";
import { formatCurrency } from "../lib/format";
import { getConvexUserId } from "../lib/session";

export function EventsScreen() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const events = useQuery(api.events.listWithTotals, userId ? { userId } : "skip");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventRowData | null>(null);

  const isLoading = userId !== null && events === undefined;

  const openCreate = () => {
    setEditEvent(null);
    setSheetOpen(true);
  };

  const openEdit = (event: NonNullable<typeof events>[number]) => {
    setEditEvent({ id: event._id, name: event.name, note: event.note });
    setSheetOpen(true);
  };

  return (
    <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-[390px] flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[1.375rem] font-bold text-ink">Events</h1>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Track income, spending, and credit by group
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-teal-brand px-3.5 py-2 text-[0.8125rem] font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-card bg-white/80 shadow-soft" />
            ))}
          </div>
        ) : (events ?? []).length === 0 ? (
          <section className="rounded-card bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-brand">
              <CalendarRange className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 font-display text-[1rem] font-semibold text-ink">No events yet</h2>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-secondary">
              Create an event to group related income, expenses, and credit — then assign entries
              when you add them.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-pill bg-teal-brand px-5 py-2.5 text-[0.875rem] font-semibold text-white shadow-sm"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Create Event
            </button>
          </section>
        ) : (
          <div className="space-y-3">
            {(events ?? []).map((event) => (
              <button
                key={event._id}
                type="button"
                onClick={() => openEdit(event)}
                className="w-full rounded-card bg-white p-4 text-left shadow-soft transition-transform active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[1rem] font-semibold text-ink">
                      {event.name}
                    </p>
                    {event.note ? (
                      <p className="mt-0.5 truncate text-[0.75rem] text-ink-muted">{event.note}</p>
                    ) : null}
                    <p className="mt-1 text-[0.6875rem] font-medium text-ink-muted">
                      {event.itemCount} {event.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" strokeWidth={2} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-surface-border pt-4">
                  <div>
                    <p className="text-[0.6875rem] font-medium text-ink-muted">Income</p>
                    <p className="mt-0.5 text-[0.875rem] font-semibold text-income">
                      {formatCurrency(event.incomeTotal, { signed: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6875rem] font-medium text-ink-muted">Expenses</p>
                    <p className="mt-0.5 text-[0.875rem] font-semibold text-expense">
                      {formatCurrency(-event.expenseTotal, { signed: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6875rem] font-medium text-ink-muted">Credit</p>
                    <p className="mt-0.5 text-[0.875rem] font-semibold text-sky-600">
                      {formatCurrency(-event.creditTotal, { signed: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6875rem] font-medium text-ink-muted">Net</p>
                    <p
                      className={`mt-0.5 text-[0.875rem] font-semibold ${
                        event.net >= 0 ? "text-ink" : "text-expense"
                      }`}
                    >
                      {formatCurrency(event.net, { signed: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <AddEventSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditEvent(null);
        }}
        userId={userId}
        editEvent={editEvent}
      />
    </div>
  );
}
