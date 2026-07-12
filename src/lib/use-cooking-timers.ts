import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";

const STORAGE_KEY = "meal-guru-cooking-timers";

export interface CookingTimer {
  id: string;
  recipeId: string;
  stepNumber: number;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  status: "idle" | "running" | "paused" | "completed";
  startedAt: number | null;
}

interface CookingTimersContextValue {
  timers: CookingTimer[];
  startTimer: (params: {
    recipeId: string;
    stepNumber: number;
    label: string;
    totalSeconds: number;
    index: number;
  }) => void;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  dismissTimer: (id: string) => void;
  clearAllTimers: () => void;
}

export const CookingTimersContext = createContext<CookingTimersContextValue>({
  timers: [],
  startTimer: () => {},
  pauseTimer: () => {},
  resumeTimer: () => {},
  resetTimer: () => {},
  dismissTimer: () => {},
  clearAllTimers: () => {},
});

type TimerAction =
  | {
      type: "START";
      id: string;
      recipeId: string;
      stepNumber: number;
      label: string;
      totalSeconds: number;
    }
  | { type: "PAUSE"; id: string }
  | { type: "RESUME"; id: string }
  | { type: "RESET"; id: string }
  | { type: "DISMISS"; id: string }
  | { type: "TICK" }
  | { type: "CLEAR_ALL" }
  | { type: "HYDRATE"; timers: CookingTimer[] };

function timerReducer(
  state: CookingTimer[],
  action: TimerAction
): CookingTimer[] {
  switch (action.type) {
    case "START": {
      const existing = state.find((t) => t.id === action.id);
      if (existing) {
        return state.map((t) =>
          t.id === action.id
            ? {
                ...t,
                status: "running" as const,
                startedAt: Date.now(),
                remainingSeconds: t.totalSeconds,
              }
            : t
        );
      }
      return [
        ...state,
        {
          id: action.id,
          recipeId: action.recipeId,
          stepNumber: action.stepNumber,
          label: action.label,
          totalSeconds: action.totalSeconds,
          remainingSeconds: action.totalSeconds,
          status: "running",
          startedAt: Date.now(),
        },
      ];
    }
    case "PAUSE":
      return state.map((t) => {
        if (t.id !== action.id || t.status !== "running") return t;
        const elapsed = t.startedAt
          ? Math.floor((Date.now() - t.startedAt) / 1000)
          : 0;
        return {
          ...t,
          status: "paused",
          remainingSeconds: Math.max(0, t.totalSeconds - elapsed),
          startedAt: null,
        };
      });
    case "RESUME":
      return state.map((t) =>
        t.id === action.id && t.status === "paused"
          ? {
              ...t,
              status: "running",
              startedAt: Date.now(),
              totalSeconds: t.remainingSeconds,
            }
          : t
      );
    case "RESET":
      return state.map((t) => {
        if (t.id !== action.id) return t;
        const originalTotal = state.find((s) => s.id === t.id);
        return {
          ...t,
          status: "idle",
          remainingSeconds: originalTotal
            ? originalTotal.totalSeconds
            : t.totalSeconds,
          startedAt: null,
        };
      });
    case "DISMISS":
      return state.filter((t) => t.id !== action.id);
    case "TICK":
      return state.map((t) => {
        if (t.status !== "running" || !t.startedAt) return t;
        const elapsed = Math.floor((Date.now() - t.startedAt) / 1000);
        const remaining = Math.max(0, t.totalSeconds - elapsed);
        if (remaining <= 0) {
          return { ...t, status: "completed", remainingSeconds: 0 };
        }
        return { ...t, remainingSeconds: remaining };
      });
    case "CLEAR_ALL":
      return [];
    case "HYDRATE":
      return action.timers;
    default:
      return state;
  }
}

function makeTimerId(
  recipeId: string,
  stepNumber: number,
  index: number
): string {
  return `${recipeId}-step${stepNumber}-${index}`;
}

function loadTimers(recipeId: string): CookingTimer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const timers: CookingTimer[] = JSON.parse(raw);
    const recipeTimers = timers.filter((t) => t.recipeId === recipeId);

    return recipeTimers.map((t) => {
      if (t.status === "running" && t.startedAt) {
        const elapsed = Math.floor((Date.now() - t.startedAt) / 1000);
        const remaining = Math.max(0, t.totalSeconds - elapsed);
        if (remaining <= 0) {
          return { ...t, status: "completed" as const, remainingSeconds: 0 };
        }
        return { ...t, remainingSeconds: remaining };
      }
      return t;
    });
  } catch {
    return [];
  }
}

function saveTimers(timers: CookingTimer[]) {
  try {
    if (timers.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    }
  } catch {
    // localStorage unavailable
  }
}

function playAlertSound() {
  try {
    const ctx = new AudioContext();
    const beep = (delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    };
    beep(0);
    beep(0.3);
    beep(0.6);
  } catch {
    // Web Audio API unavailable
  }
}

export function useCookingTimers(recipeId: string): CookingTimersContextValue {
  const [timers, dispatch] = useReducer(timerReducer, recipeId, loadTimers);
  const prevTimersRef = useRef<CookingTimer[]>(timers);

  // Persist to localStorage on every state change
  useEffect(() => {
    saveTimers(timers);
  }, [timers]);

  // Play alert when a timer transitions to completed
  useEffect(() => {
    const prev = prevTimersRef.current;
    for (const timer of timers) {
      if (timer.status === "completed") {
        const prevTimer = prev.find((t) => t.id === timer.id);
        if (prevTimer && prevTimer.status !== "completed") {
          playAlertSound();
          break;
        }
      }
    }
    prevTimersRef.current = timers;
  }, [timers]);

  // Tick interval for running timers
  useEffect(() => {
    const hasRunning = timers.some((t) => t.status === "running");
    if (!hasRunning) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [timers]);

  const startTimer = useCallback(
    (params: {
      recipeId: string;
      stepNumber: number;
      label: string;
      totalSeconds: number;
      index: number;
    }) => {
      dispatch({
        type: "START",
        id: makeTimerId(params.recipeId, params.stepNumber, params.index),
        recipeId: params.recipeId,
        stepNumber: params.stepNumber,
        label: params.label,
        totalSeconds: params.totalSeconds,
      });
    },
    []
  );

  const pauseTimer = useCallback((id: string) => {
    dispatch({ type: "PAUSE", id });
  }, []);

  const resumeTimer = useCallback((id: string) => {
    dispatch({ type: "RESUME", id });
  }, []);

  const resetTimer = useCallback((id: string) => {
    dispatch({ type: "RESET", id });
  }, []);

  const dismissTimer = useCallback((id: string) => {
    dispatch({ type: "DISMISS", id });
  }, []);

  const clearAllTimers = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  return {
    timers,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    dismissTimer,
    clearAllTimers,
  };
}

export function useCookingTimersContext() {
  return useContext(CookingTimersContext);
}
