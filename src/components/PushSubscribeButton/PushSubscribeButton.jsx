import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'

export default function PushSubscribeButton() {
	const { isAuthenticated } = useAuth()
	const { permissionStatus, requestPermission } =
		useNotifications(isAuthenticated)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [showInstructions, setShowInstructions] = useState(false)
	const [isIOS, setIsIOS] = useState(false)

	// Safari браузерини аниқлаш
	useEffect(() => {
		const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
		setIsIOS(isSafari)
	}, [])

	const handleSubscribe = async () => {
		try {
			setLoading(true)
			setError(null)

			const result = await requestPermission()
			if (!result.success) {
				setShowInstructions(true)
				setError(result.error)
			}
		} catch (error) {
			console.error('Subscribe error:', error)
			setError(error.message)
		} finally {
			setLoading(false)
		}
	}

	if (!window.OneSignal?.initialized) return null
	if (permissionStatus === 'granted') return null

	return (
		<>
			<div className='fixed bottom-20 right-4 z-40'>
				<button
					onClick={handleSubscribe}
					disabled={loading}
					className={`
						bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg
						${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
					`}
				>
					{loading ? 'Подключение...' : 'Включить уведомления'}
				</button>
				{error && !showInstructions && (
					<p className='text-red-500 text-sm mt-1 bg-white p-2 rounded shadow-lg'>
						Ошибка при подключении уведомлений
					</p>
				)}
			</div>

			{showInstructions && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg p-6 max-w-md w-full'>
						<h3 className='text-lg font-bold mb-4'>Как включить уведомления</h3>
						<ol className='list-decimal pl-5 space-y-2 mb-4'>
							{isIOS ? (
								<>
									<li>Откройте настройки Safari</li>
									<li>Перейдите в раздел "Уведомления"</li>
									<li>Найдите наш сайт</li>
									<li>Включите уведомления</li>
								</>
							) : (
								<>
									<li>Нажмите на значок 🔒 слева от адресной строки</li>
									<li>Найдите раздел "Уведомления"</li>
									<li>Измените значение на "Разрешить"</li>
									<li>Обновите страницу</li>
								</>
							)}
						</ol>
						<div className='flex justify-end space-x-2'>
							<button
								onClick={() => setShowInstructions(false)}
								className='px-4 py-2 text-gray-600 hover:text-gray-800'
							>
								Закрыть
							</button>
							{!isIOS && (
								<button
									onClick={() => {
										setShowInstructions(false)
										handleSubscribe()
									}}
									className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
								>
									Попробовать снова
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	)
}
