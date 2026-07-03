import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "gradient-card rounded-2xl border border-slate-200/80 p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
