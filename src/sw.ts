/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const navigationHandler = new NetworkFirst({
  cacheName: "app-shell",
  networkTimeoutSeconds: 3,
});

const navigationRoute = new NavigationRoute(navigationHandler, {
  denylist: [/^\/api\//, /^\/oauth\//, /^\/.well-known\//],
});
registerRoute(navigationRoute);

self.skipWaiting();
self.clients.claim();
