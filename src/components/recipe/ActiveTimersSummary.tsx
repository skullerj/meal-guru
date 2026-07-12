import IconButton from "@/components/shared/IconButton";
import { useCookingTimersContext } from "@/lib/use-cooking-timers";
import { cn } from "@/lib/utils";

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

function statusDotClass(status: string): string {
  switch (status) {
    case "running":
      return "bg-green-500";
    case "paused":
      return "bg-yellow-500";
    case "completed":
      return "bg-destructive animate-pulse";
    default:
      return "bg-muted-foreground";
  }
}

export default function ActiveTimersSummary() {
  const { timers, dismissTimer } = useCookingTimersContext();

  if (timers.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border pb-4">
      <div className="max-h-40 overflow-y-auto px-4 pt-3">
        <div className="flex flex-col gap-2">
          {timers.map((timer) => (
            <div
              key={timer.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    statusDotClass(timer.status)
                  )}
                />
                <span className="text-sm truncate">
                  Step {timer.stepNumber}: {formatTime(timer.remainingSeconds)}
                </span>
              </div>
              <IconButton
                icon="x"
                aria-label={`Dismiss step ${timer.stepNumber} timer`}
                variant="ghost"
                size="sm"
                onClick={() => dismissTimer(timer.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
