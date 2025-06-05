import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
	checkSubscriptionStatus,
	setOneSignalExternalId,
} from '../../services/oneSignal'

export default function NotificationComponent() {
	const { isAuthenticated, userData } = useAuth()

	useEffect(() => {
		if (isAuthenticated && userData?.id) {
			setOneSignalExternalId(userData.id)
			// Ҳар 30 секундда ҳолатни текшириш
			const interval = setInterval(() => {
				checkSubscriptionStatus()
			}, 30000)

			return () => clearInterval(interval)
		}
	}, [isAuthenticated, userData])

	return null
}
