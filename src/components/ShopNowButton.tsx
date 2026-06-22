import { useState } from "react";
import Button from "@/components/shared/Button";
import { supabase } from "@/lib/supabase-browser";
import { getActiveShopForWeek, recommendRecipeIds, createShop } from "@/lib/database";

export default function ShopNowButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(false);
    try {
      const existing = await getActiveShopForWeek(supabase);
      if (existing) {
        window.location.href = `/shop/${existing.id}`;
        return;
      }
      const ids = await recommendRecipeIds(supabase);
      const shop = await createShop(supabase, ids);
      window.location.href = `/shop/${shop.id}`;
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="primary"
        size="lg"
        leftIcon="shopping-cart"
        onClick={handleClick}
        loading={loading}
      >
        Shop Now
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-2">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}
