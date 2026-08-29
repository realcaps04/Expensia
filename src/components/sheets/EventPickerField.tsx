import { useQuery } from "convex/react";
import { Layers } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { SheetFieldRow, SheetSelect } from "./SheetFieldRow";

const NONE = "";

type EventPickerFieldProps = {
  userId: Id<"users"> | null;
  value: string;
  onChange: (value: string) => void;
};

export function EventPickerField({ userId, value, onChange }: EventPickerFieldProps) {
  const events = useQuery(api.events.list, userId ? { userId } : "skip");

  const options = [
    { value: NONE, label: "No event" },
    ...(events ?? []).map((event) => ({
      value: event._id,
      label: event.name,
    })),
  ];

  return (
    <SheetFieldRow icon={<Layers className="h-4 w-4" />} label="Event (Optional)">
      <SheetSelect
        value={value}
        onChange={onChange}
        options={options}
        disabled={!userId || events === undefined}
      />
    </SheetFieldRow>
  );
}

export function parseEventId(value: string): Id<"events"> | undefined {
  return value ? (value as Id<"events">) : undefined;
}
