/** Remove cached service workers that can serve HTML without CSS (common on mobile dev). */
export function clearStaleServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
  });

  if ("caches" in window) {
    void caches.keys().then((keys) => {
      for (const key of keys) {
        void caches.delete(key);
      }
    });
  }
}
