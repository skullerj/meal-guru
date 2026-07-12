import Button from "@/components/shared/Button";
import type { ParsedDuration } from "@/lib/parse-duration";
import { useCookingTimersContext } from "@/lib/use-cooking-timers";

interface TimerButtonProps {
  recipeId: string;
  stepNumber: number;
  duration: ParsedDuration;
  index: number;
}

export default function TimerButton({
  recipeId,
  stepNumber,
  duration,
  index,
}: TimerButtonProps) {
  const { timers, startTimer } = useCookingTimersContext();

  const timerId = `${recipeId}-step${stepNumber}-${index}`;
  const existingTimer = timers.find((t) => t.id === timerId);

  const isActive =
    existingTimer &&
    (existingTimer.status === "running" ||
      existingTimer.status === "paused" ||
      existingTimer.status === "completed");

  function handleClick() {
    if (isActive) return;
    startTimer({
      recipeId,
      stepNumber,
      label: duration.label,
      totalSeconds: duration.durationSeconds,
      index,
    });
  }

  let label = duration.label;
  if (existingTimer?.status === "running") {
    label = "Running";
  } else if (existingTimer?.status === "paused") {
    label = "Paused";
  } else if (existingTimer?.status === "completed") {
    label = "Time's up!";
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      leftIcon="timer"
      onClick={handleClick}
      disabled={isActive}
    >
      {label}
    </Button>
  );
}
