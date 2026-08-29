import { useQuery } from "convex/react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { EventCard, formatEventMonth } from "../components/events/EventCard";
import { EventsEmptyFooter } from "../components/events/EventsEmptyFooter";
import { AddEventSheet, type EventRowData } from "../components/sheets/AddEventSheet";
import {
  emptyEventRef,
  EventDetailSheet,
  eventToRef,
  type EventRef,
} from "../components/sheets/EventDetailSheet";
import { useAuth } from "../context/AuthProvider";
import { useQuickAdd } from "../context/QuickAddProvider";
import { getConvexUserId } from "../lib/session";

type SortMode = "recent" | "name";

export function EventsScreen() {
  const { user } = useAuth();
  const { openSheet } = useQuickAdd();
  const userId = getConvexUserId(user);
  const events = useQuery(api.events.listWithTotals, userId ? { userId } : "skip");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventRowData | null>(null);
  const [detailEvent, setDetailEvent] = useState<EventRef | null>(null);
  const [detailIsNew, setDetailIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const isLoading = userId !== null && events === undefined;

  const filteredEvents = useMemo(() => {
    const rows = events ?? [];
    const query = search.trim().toLowerCase();
    let list = query
      ? rows.filter(
          (event) =>
            event.name.toLowerCase().includes(query) ||
            event.note?.toLowerCase().includes(query),
        )
      : rows;

    if (sortMode === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [events, search, sortMode]);

  const openCreate = () => {
    setEditEvent(null);
    setEditSheetOpen(true);
  };

  const openEdit = (event: NonNullable<typeof events>[number]) => {
    setDetailEvent(null);
    setEditEvent({ id: event._id, name: event.name, note: event.note });
    setEditSheetOpen(true);
  };

  const openDetail = (event: NonNullable<typeof events>[number]) => {
    setDetailIsNew(false);
    setDetailEvent(eventToRef(event));
  };

  const openEntrySheet = (type: "income" | "expense" | "credit", eventId: Id<"events">) => {
    setDetailEvent(null);
    openSheet(type, { eventId });
  };

  const toggleSort = () => {
    setSortMode((mode) => (mode === "recent" ? "name" : "recent"));
  };

  return (
    <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-[390px] flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[1.625rem] font-bold tracking-tight text-ink">
              Events
            </h1>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Track income, spending, and credit by group
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-teal-brand px-4 py-2.5 text-[0.8125rem] font-semibold text-white shadow-[0_4px_14px_rgba(13,148,136,0.28)] transition-transform active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Event
          </button>
        </div>

        {!isLoading && (events ?? []).length > 0 ? (
          <div className="flex items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                strokeWidth={2}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full rounded-[14px] border border-transparent bg-white py-3 pl-10 pr-4 text-[0.875rem] text-ink shadow-[0_2px_12px_rgba(15,23,42,0.05)] placeholder:text-ink-muted/70 focus:border-teal-brand/30 focus:outline-none focus:ring-2 focus:ring-teal-brand/15"
              />
            </label>
            <button
              type="button"
              onClick={toggleSort}
              aria-label={sortMode === "recent" ? "Sort by name" : "Sort by recent"}
              title={sortMode === "recent" ? "Sorted by recent" : "Sorted A–Z"}
              className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] border bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-colors ${
                sortMode === "name"
                  ? "border-teal-brand/40 text-teal-brand"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[280px] animate-pulse rounded-[20px] bg-white/80 shadow-soft"
              />
            ))}
          </div>
        ) : (events ?? []).length === 0 ? (
          <EventsEmptyFooter onCreate={openCreate} variant="empty" />
        ) : filteredEvents.length === 0 ? (
          <section className="rounded-[20px] bg-white px-6 py-10 text-center shadow-soft">
            <p className="font-display text-[1rem] font-semibold text-ink">No matches</p>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Try a different search term.
            </p>
          </section>
        ) : (
          <>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  monthLabel={formatEventMonth(event.createdAt)}
                  onEdit={() => openEdit(event)}
                  onOpen={() => openDetail(event)}
                  onAddIncome={() => openEntrySheet("income", event._id)}
                  onAddExpense={() => openEntrySheet("expense", event._id)}
                  onAddCredit={() => openEntrySheet("credit", event._id)}
                />
              ))}
            </div>

            {!search.trim() ? (
              <EventsEmptyFooter onCreate={openCreate} variant="end-of-list" />
            ) : null}
          </>
        )}
      </div>

      <AddEventSheet
        open={editSheetOpen}
        onClose={() => {
          setEditSheetOpen(false);
          setEditEvent(null);
        }}
        userId={userId}
        editEvent={editEvent}
        onSaved={({ eventId, name, note, isNew }) => {
          if (isNew) {
            setDetailIsNew(true);
            setDetailEvent(emptyEventRef(eventId, name, note));
          }
        }}
      />

      {detailEvent ? (
        <EventDetailSheet
          open
          onClose={() => {
            setDetailEvent(null);
            setDetailIsNew(false);
          }}
          event={detailEvent}
          isNew={detailIsNew}
          onEdit={() => {
            setDetailEvent(null);
            setDetailIsNew(false);
            setEditEvent({
              id: detailEvent.eventId,
              name: detailEvent.name,
              note: detailEvent.note,
            });
            setEditSheetOpen(true);
          }}
          onAddIncome={() => openEntrySheet("income", detailEvent.eventId)}
          onAddExpense={() => openEntrySheet("expense", detailEvent.eventId)}
          onAddCredit={() => openEntrySheet("credit", detailEvent.eventId)}
        />
      ) : null}
    </div>
  );
}
