import { useEffect, useState } from 'react'
import { getSubscriptionState, getUserId, requestNotificationPermission } from '../services/oneSignal'

export const useNotifications = (isAuthenticated) => {
    const [notification, setNotification] = useState(null)
    const [permissionStatus, setPermissionStatus] = useState('default')
    const [isSupported, setIsSupported] = useState(true)
    const [isStandalone, setIsStandalone] = useState(false)

    // PWA ҳолатини текшириш
    useEffect(() => {
        const isIOSStandalone = window.navigator.standalone
        const isOtherStandalone = window.matchMedia('(display-mode: standalone)').matches
        setIsStandalone(isIOSStandalone || isOtherStandalone)
    }, [])

    // Рухсат ҳолатини текшириш
    useEffect(() => {
        const checkPermission = async () => {
            const permission = await getSubscriptionState()
            setPermissionStatus(permission)
        }

        if (isAuthenticated) {
            checkPermission()
        }
    }, [isAuthenticated])

    // Push рухсатини сўраш
    const requestPermission = async () => {
        try {
            const result = await requestNotificationPermission()
            if (result.success) {
                const userId = await getUserId()
                if (userId) {
                    // Серверга OneSignal user ID ни юбориш
                    await fetch(`${import.meta.env.VITE_API_URL}/notifications/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            oneSignalUserId: userId
                        })
                    })
                }
                setPermissionStatus('granted')
                return { success: true }
            }
            return { success: false, error: 'permission_denied' }
        } catch (error) {
            console.error('Permission request error:', error)
            return { success: false, error: error.message }
        }
    }

    return {
        notification,
        permissionStatus,
        isSupported,
        isStandalone,
        requestPermission,
        clearNotification: () => setNotification(null)
    }
} 