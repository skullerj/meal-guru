import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { createIDBPersister } from "@/lib/idb-persister";
import { router } from "./router";

const persister = createIDBPersister();

export default function App() {
	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{ persister, maxAge: 24 * 60 * 60 * 1000 }}
		>
			<RouterProvider router={router} />
		</PersistQueryClientProvider>
	);
}
