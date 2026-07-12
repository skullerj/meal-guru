import IconButton from "@/components/shared/IconButton";
import type { CookingTimer } from "@/lib/use-cooking-timers";
import { useCookingTimersContext } from "@/lib/use-cooking-timers";
import { cn } from "@/lib/utils";

interface TimerCountdownProps {
  timer: CookingTimer;
}

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

export default function TimerCountdown({ timer }: TimerCountdownProps) {
  const { pauseTimer, resumeTimer, resetTimer, dismissTimer } =
    useCookingTimersContext();

  const isRunning = timer.status === "running";
  const isPaused = timer.status === "paused";
  const isCompleted = timer.status === "completed";
  const isIdle = timer.status === "idle";

  return (
    <div className="rounded-lg border border-border bg-card p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{timer.label}</span>
          <span
            className={cn(
              "text-3xl font-mono font-semibold tabular-nums",
              isRunning && "animate-pulse",
              isPaused && "text-muted-foreground",
              isCompleted && "text-destructive animate-bounce"
            )}
          >
            {formatTime(timer.remainingSeconds)}
          </span>
          {isCompleted && (
            <span className="text-sm font-medium text-destructive">
              Time's up!
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isRunning && (
            <IconButton
              icon="pause"
              aria-label="Pause timer"
              variant="ghost"
              size="sm"
              onClick={() => pauseTimer(timer.id)}
            />
          )}
          {(isPaused || isIdle) && (
            <IconButton
              icon="play"
              aria-label="Resume timer"
              variant="ghost"
              size="sm"
              onClick={() => resumeTimer(timer.id)}
            />
          )}
          {isCompleted && (
            <IconButton
              icon="play"
              aria-label="Restart timer"
              variant="ghost"
              size="sm"
              onClick={() => resetTimer(timer.id)}
            />
          )}
          <IconButton
            icon="rotate-ccw"
            aria-label="Reset timer"
            variant="ghost"
            size="sm"
            onClick={() => resetTimer(timer.id)}
          />
          <IconButton
            icon="x"
            aria-label="Dismiss timer"
            variant="ghost"
            size="sm"
            onClick={() => dismissTimer(timer.id)}
          />
        </div>
      </div>
    </div>
  );
}
