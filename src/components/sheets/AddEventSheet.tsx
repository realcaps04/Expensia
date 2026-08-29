import { useMutation } from "convex/react";
import { CalendarRange, Check, Loader2, NotebookPen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { BottomSheet } from "./BottomSheet";
import { ConfirmSheet, deleteItemMessage } from "./ConfirmSheet";
import { SheetFieldRow, SheetNativeInput } from "./SheetFieldRow";

export type EventRowData = {
  id: string;
  name: string;
  note?: string;
};

type AddEventSheetProps = {
  open: boolean;
  onClose: () => void;
  userId: Doc<"users">["_id"] | null;
  editEvent?: EventRowData | null;
  onSaved?: (payload: {
    eventId: Id<"events">;
    name: string;
    note?: string;
    isNew: boolean;
  }) => void;
};

export function AddEventSheet({
  open,
  onClose,
  userId,
  editEvent = null,
  onSaved,
}: AddEventSheetProps) {
  const isEdit = editEvent !== null;
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editEvent) {
      setName(editEvent.name);
      setNote(editEvent.note ?? "");
    } else {
      setName("");
      setNote("");
    }
    setError("");
    setDeleteConfirmOpen(false);
  }, [open, editEvent]);

  const handleSave = async () => {
    if (!userId) {
      setError("Please sign in to save.");
      return;
    }
    if (!name.trim()) {
      setError("Enter an event name.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (isEdit && editEvent) {
        await updateEvent({
          userId,
          eventId: editEvent.id as Id<"events">,
          name: name.trim(),
          note: note.trim() || undefined,
        });
        onSaved?.({
          eventId: editEvent.id as Id<"events">,
          name: name.trim(),
          note: note.trim() || undefined,
          isNew: false,
        });
      } else {
        const eventId = await createEvent({
          userId,
          name: name.trim(),
          note: note.trim() || undefined,
        });
        onSaved?.({
          eventId,
          name: name.trim(),
          note: note.trim() || undefined,
          isNew: true,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!userId || !editEvent) return;

    setBusy(true);
    setError("");
    try {
      await removeEvent({
        userId,
        eventId: editEvent.id as Id<"events">,
      });
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  const title = isEdit ? "Edit Event" : "Add Event";

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title={title}
        footer={
          <div className="space-y-2">
            {error ? <p className="text-center text-[0.8125rem] text-rose-500">{error}</p> : null}
            <button
              type="button"
              disabled={busy}
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-violet-500 to-violet-600 py-3.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgba(139,92,246,0.28)] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                  {isEdit ? "Update Event" : "Create Event"}
                </>
              )}
            </button>
            {isEdit ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-rose-200 bg-rose-50 py-3 text-[0.875rem] font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete Event
              </button>
            ) : null}
          </div>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-brand">
            <CalendarRange className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h3 className="font-display text-[1.125rem] font-bold text-ink">{title}</h3>
          <p className="mt-1 max-w-[280px] text-[0.8125rem] leading-relaxed text-ink-secondary">
            Group income, expenses, and credit under one name — like a trip, wedding, or project.
          </p>
        </div>

        <div className="mt-6 rounded-[20px] bg-white px-4 py-2 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <SheetFieldRow icon={<CalendarRange className="h-4 w-4" />} label="Event Name">
            <SheetNativeInput
              type="text"
              value={name}
              onChange={setName}
              placeholder="e.g. Goa Trip, Wedding"
            />
          </SheetFieldRow>

          <SheetFieldRow icon={<NotebookPen className="h-4 w-4" />} label="Note (Optional)">
            <SheetNativeInput
              type="text"
              value={note}
              onChange={setNote}
              placeholder="Add details about this event"
            />
          </SheetFieldRow>
        </div>
      </BottomSheet>

      <ConfirmSheet
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete event?"
        message={editEvent ? deleteItemMessage(editEvent.name) : ""}
        confirmLabel="Delete"
        busy={busy}
      />
    </>
  );
}
