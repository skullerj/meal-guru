export interface ParsedDuration {
  durationSeconds: number;
  label: string;
}

const DURATION_PATTERN =
  /(\d+(?:\.\d+)?)\s*(?:-)?\s*(?:\d+(?:\.\d+)?\s*)?(?:hours?|hrs?|h)\s*(?:(?:and\s*)?(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m))?|(\d+(?:\.\d+)?)\s*(?:minutes?|mins?)|(\d+(?:\.\d+)?)\s*(?:seconds?|secs?)/gi;

export function parseDurations(text: string): ParsedDuration[] {
  const results: ParsedDuration[] = [];

  for (const match of text.matchAll(DURATION_PATTERN)) {
    const hoursStr = match[1];
    const hourMinutesStr = match[2];
    const minutesStr = match[3];
    const secondsStr = match[4];

    let totalSeconds = 0;
    let label = "";

    if (hoursStr !== undefined) {
      const hours = Number.parseFloat(hoursStr);
      totalSeconds += hours * 3600;
      label = hours === 1 ? "1 hour" : `${hours} hours`;

      if (hourMinutesStr !== undefined) {
        const mins = Number.parseFloat(hourMinutesStr);
        totalSeconds += mins * 60;
        label += ` ${mins} min`;
      }
    } else if (minutesStr !== undefined) {
      const mins = Number.parseFloat(minutesStr);
      totalSeconds += mins * 60;
      label = mins === 1 ? "1 min" : `${mins} min`;
    } else if (secondsStr !== undefined) {
      const secs = Number.parseFloat(secondsStr);
      totalSeconds += secs;
      label = secs === 1 ? "1 sec" : `${secs} sec`;
    }

    if (totalSeconds > 0) {
      results.push({ durationSeconds: totalSeconds, label });
    }
  }

  return results;
}
