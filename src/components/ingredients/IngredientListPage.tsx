import QueryProvider from "@/components/QueryProvider";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import PageLayout from "@/components/shared/PageLayout";
import { useIngredients } from "@/lib/queries";
import IngredientList from "./IngredientList";

function Content() {
  const { data: ingredients, isLoading } = useIngredients();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <PageLayout title="Ingredients" backLabel="Home" backUrl="/">
      <IngredientList ingredients={ingredients ?? []} />
    </PageLayout>
  );
}

export default function IngredientListPage() {
  return (
    <QueryProvider>
      <Content />
    </QueryProvider>
  );
}
