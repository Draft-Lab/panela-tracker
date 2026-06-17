import type React from "react";

export default function RetrospectivaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background dark">
      <div className="relative h-dvh w-full max-w-md overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}
