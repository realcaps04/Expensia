import type { ReactNode } from "react";

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-surface">
      <div className="app-frame relative flex min-h-dvh w-full max-w-shell flex-col bg-surface md:my-6 md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-[28px]">
        {children}
      </div>
    </div>
  );
}
