import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Button from "@/components/shared/Button";
import {
  createShop,
  deactivateShopsForWeek,
  getWeekMonday,
  recommendRecipeIds,
} from "@/lib/database";
import { supabase } from "@/lib/supabase-browser";

export default function StartNewWeekButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const weekMonday = getWeekMonday();
      await deactivateShopsForWeek(supabase, weekMonday);
      const ids = await recommendRecipeIds(supabase);
      const shop = await createShop(supabase, ids);
      navigate({ to: "/shop/$id", params: { id: shop.id } });
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
