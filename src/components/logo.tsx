import { cn } from "@/lib/utils";

export function StorkLogo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2 group">
      <div
        className={cn(
          "p-2 rounded-full bg-primary/20 transition-colors",
          light ? "bg-white/20" : ""
        )}
      >
        <svg
          className={cn("w-6 h-6 text-primary", light ? "text-white" : "")}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.5 7.5C14.5 9.433 12.933 11 11 11C9.067 11 7.5 9.433 7.5 7.5C7.5 5.567 9.067 4 11 4C12.933 4 14.5 5.567 14.5 7.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M13.5 16C13.5 17.6569 12.1569 19 10.5 19C8.84315 19 7.5 17.6569 7.5 16C7.5 14.3431 8.84315 13 10.5 13H13.5V16ZM13.5 16V20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M8.5 20L10.5 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M16 13L15 8L11 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>
      <span
        className={cn(
          "font-headline font-bold text-xl text-slate-800",
          light ? "text-white" : ""
        )}
      >
        StorkWatch
      </span>
    </div>
  );
}
