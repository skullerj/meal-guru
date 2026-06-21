import { actions } from "astro:actions";
import { useState } from "react";
import Button from "@/components/shared/Button";

export default function ShopNowButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(false);
    const { data, error: err } = await actions.shops.getOrCreateWeeklyShop({});
    if (err) {
      setError(true);
      setLoading(false);
      return;
    }
    window.location.href = `/shop/${data.id}`;
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
