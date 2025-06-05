import { getMessaging, getToken } from 'firebase/messaging'
import { useCallback, useState } from 'react'
import { app } from '../firebase/firebase'

export const usePushNotification = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const subscribeToPush = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // 1. Рухсат сўраш
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                throw new Error('Notification permission denied')
            }

            // 2. Service Worker рўйхатдан ўтказиш
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
            console.log('ServiceWorker registered:', registration)

            // 3. FCM токен олиш
            const messaging = getMessaging(app)
            const currentToken = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration
            })

            if (!currentToken) {
                throw new Error('Failed to get FCM token')
            }

            // 4. Токенни серверга юбориш
            const response = await fetch('http://172.20.10.3:3000/api/notifications/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    subscription: {
                        endpoint: currentToken,
                        keys: {
                            p256dh: 'not-used',
                            auth: 'not-used'
                        }
                    }
                })
            })

            if (!response.ok) {
                throw new Error('Failed to register subscription with server')
            }

            console.log('Successfully subscribed to push notifications')
            return currentToken

        } catch (err) {
            setError(err.message)
            console.error('Push subscription error:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        subscribeToPush,
        loading,
        error
    }
} 