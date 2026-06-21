import { actions } from "astro:actions";
import { useState } from "react";
import Button from "@/components/shared/Button";

export default function StartNewWeekButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const { data, error } = await actions.shops.startNewWeek({});
    if (error) {
      setLoading(false);
      return;
    }
    window.location.href = `/shop/${data.id}`;
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      loading={loading}
    >
      Start new week
    </Button>
  );
}
