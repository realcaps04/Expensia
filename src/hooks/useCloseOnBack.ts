import { useEffect, useRef } from "react";

type ModalEntry = {
  id: number;
  close: () => void;
};

const MODAL_STATE_KEY = "expensiaModal";
const stack: ModalEntry[] = [];
let nextModalId = 0;
let suppressPopState = false;
let listenerAttached = false;

function handlePopState() {
  if (suppressPopState) {
    suppressPopState = false;
    return;
  }

  const top = stack[stack.length - 1];
  top?.close();
}

function ensureListener() {
  if (listenerAttached || typeof window === "undefined") return;
  window.addEventListener("popstate", handlePopState);
  listenerAttached = true;
}

export function useCloseOnBack(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    ensureListener();

    const id = ++nextModalId;
    const entry: ModalEntry = {
      id,
      close: () => onCloseRef.current(),
    };

    stack.push(entry);
    window.history.pushState({ [MODAL_STATE_KEY]: id }, "");

    return () => {
      const index = stack.findIndex((item) => item.id === id);
      if (index >= 0) stack.splice(index, 1);

      if (window.history.state?.[MODAL_STATE_KEY] === id) {
        suppressPopState = true;
        window.history.back();
      }
    };
  }, [open]);
}
