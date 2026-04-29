import { useState } from "react";
import { actions } from "astro:actions";
import Button from "@/components/shared/Button";

interface CommitShopButtonProps {
  recipeIds: string[];
}

export default function CommitShopButton({ recipeIds }: CommitShopButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleCommit() {
    setState("loading");
    const { error } = await actions.shops.commit({ recipeIds });
    if (error) {
      setState("error");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <p className="text-sm text-center text-muted-foreground">
        Committed! These recipes won't be auto-picked for 2 weeks.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="success"
        size="lg"
        className="w-full max-w-sm"
        loading={state === "loading"}
        onClick={handleCommit}
      >
        Commit to this week
      </Button>
      {state === "error" && (
        <p className="text-xs text-destructive">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
