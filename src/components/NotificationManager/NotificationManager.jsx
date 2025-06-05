import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getFCMToken, onMessageListener } from '../../firebase/firebase'

export default function NotificationManager() {
	const { isAuthenticated } = useAuth()
	const [notification, setNotification] = useState(null)
	const [isSupported, setIsSupported] = useState(true)
	const [permissionStatus, setPermissionStatus] = useState('default')

	useEffect(() => {
		const setupNotifications = async () => {
			try {
				if (isAuthenticated) {
					console.log('Getting FCM token...')
					const result = await getFCMToken()

					if (!result.success) {
						if (result.error === 'permission_denied') {
							setPermissionStatus('denied')
							// Фойдаланувчига notification созламаларини очиш ҳақида хабар кўрсатиш мумкин
							setNotification({
								title: 'Уведомления отключены',
								body: 'Для получения уведомлений, пожалуйста, разрешите их в настройках браузера',
							})
						} else if (result.error === 'messaging_not_supported') {
							setIsSupported(false)
						}
					} else {
						setPermissionStatus('granted')
					}
				}
			} catch (error) {
				console.error('Error:', error)
				setIsSupported(false)
			}
		}

		setupNotifications()
	}, [isAuthenticated])

	// Notification созламаларини очиш функцияси
	const openNotificationSettings = () => {
		if (navigator.permissions) {
			navigator.permissions.query({ name: 'notifications' }).then(result => {
				if (result.state === 'denied') {
					// Браузер созламаларини очиш учун йўриқнома
					setNotification({
						title: 'Как включить уведомления',
						body: '1. Откройте настройки сайта\n2. Найдите раздел "Уведомления"\n3. Выберите "Разрешить"',
					})
				}
			})
		}
	}

	useEffect(() => {
		if (!isSupported || !isAuthenticated || permissionStatus !== 'granted')
			return

		const setupMessageListener = async () => {
			try {
				const messageListener = await onMessageListener()
				messageListener
					.then(payload => {
						console.log('Setting notification:', payload)
						setNotification({
							title: payload.notification.title,
							body: payload.notification.body,
						})
					})
					.catch(err => {
						console.error('Failed to setup message listener:', err)
					})
			} catch (error) {
				console.error('Error setting up message listener:', error)
			}
		}

		setupMessageListener()
	}, [isSupported, isAuthenticated, permissionStatus])

	if (!notification) return null

	return (
		<div className='fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50'>
			<h4 className='font-bold'>{notification.title}</h4>
			<p className='whitespace-pre-line'>{notification.body}</p>
			{permissionStatus === 'denied' && (
				<button
					onClick={openNotificationSettings}
					className='mt-2 text-blue-600 underline'
				>
					Включить уведомления
				</button>
			)}
			<button
				onClick={() => setNotification(null)}
				className='absolute top-2 right-2 text-gray-500'
			>
				✕
			</button>
		</div>
	)
}
