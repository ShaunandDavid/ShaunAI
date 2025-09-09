import * as React from "react";
export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-sm p-4 ${className}`} {...props} />;
}
export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-2 flex items-center justify-between ${className}`} {...props} />;
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}
export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`text-sm space-y-2 ${className}`} {...props} />;
}
