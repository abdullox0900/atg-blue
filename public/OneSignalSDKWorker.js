importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js')

self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('push', function (event) {
    if (event && event.data) {
        try {
            const data = event.data.json()
            event.waitUntil(
                self.registration.showNotification(data.title || 'ATG Gaz', {
                    body: data.message || data.body || 'Новое уведомление',
                    icon: '/favicon.png',
                    badge: '/favicon.png',
                    requireInteraction: true
                })
            )
        } catch (e) {
            console.error('Error showing notification:', e)
        }
    }
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    event.waitUntil(
        clients.openWindow('/')
    )
})