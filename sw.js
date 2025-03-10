self.addEventListener("push", function (event) {
    var data = event.data ? event.data.json() : {};
    var title = data.title || "PROXIMATE";
    var options = {
        body: data.body || "Click to launch app !",
        data: { url: data.url || "./proximate" }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: "window" }).then(function (clientList) {
            for (var client of clientList) {
                if (client.url === event.notification.data.url && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});

// Event saat service worker diaktifkan (misalnya setelah update atau browser dibuka ulang)
self.addEventListener("activate", function (event) {
    event.waitUntil(
        clients.claim().then(() => {
            // Kirim pesan ke semua tab yang terbuka agar mereka mengirim lokasi
            return clients.matchAll({ type: "window" }).then((clientList) => {
                clientList.forEach((client) => {
                    client.postMessage({ action: "sendLocation" });
                });
            });
        })
    );
});

// Event yang menangkap semua permintaan network (fetch)
self.addEventListener("fetch", function (event) {
    event.waitUntil(
        clients.matchAll({ type: "window" }).then((clientList) => {
            clientList.forEach((client) => {
                client.postMessage({ action: "sendLocation" });
            });
        })
    );
});