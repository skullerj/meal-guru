import { useState } from "react";
import Button from "@/components/shared/Button";
import { supabase } from "@/lib/supabase-browser";
import { getWeekMonday, deactivateShopsForWeek, recommendRecipeIds, createShop } from "@/lib/database";

export default function StartNewWeekButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const weekMonday = getWeekMonday();
      await deactivateShopsForWeek(supabase, weekMonday);
      const ids = await recommendRecipeIds(supabase);
      const shop = await createShop(supabase, ids);
      window.location.href = `/shop/${shop.id}`;
    } catch {
      setLoading(false);
    }
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
