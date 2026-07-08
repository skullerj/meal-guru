import { useNavigate } from "@tanstack/react-router";
import Button from "@/components/shared/Button";
import { useStartNewWeek } from "@/lib/mutations";

export default function StartNewWeekButton() {
  const navigate = useNavigate();
  const startNewWeek = useStartNewWeek();

  function handleClick() {
    startNewWeek.mutate(undefined, {
      onSuccess: (shop) => {
        navigate({ to: "/shop/$id", params: { id: shop.id } });
      },
    });
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      loading={startNewWeek.isPending}
    >
      Start new week
    </Button>
  );
}
