import type { ReactNode } from "react";

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-surface md:h-auto md:min-h-dvh md:overflow-visible">
      <div className="app-frame relative flex h-full min-h-0 w-full max-w-shell flex-col overflow-hidden bg-surface md:my-6 md:h-auto md:min-h-[calc(100dvh-3rem)] md:rounded-[28px]">
        {children}
      </div>
    </div>
  );
}
