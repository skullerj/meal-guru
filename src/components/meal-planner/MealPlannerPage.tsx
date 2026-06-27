import QueryProvider from "@/components/QueryProvider";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import PageLayout from "@/components/shared/PageLayout";
import { useRecipes } from "@/lib/queries";
import MealPlanner from "./MealPlanner";

function Content() {
  const { data: recipes, isLoading } = useRecipes();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <PageLayout title="Plan your week" backUrl="/" backLabel="Back">
      <MealPlanner recipes={recipes ?? []} />
    </PageLayout>
  );
}

export default function MealPlannerPage() {
  return (
    <QueryProvider>
      <Content />
    </QueryProvider>
  );
}
