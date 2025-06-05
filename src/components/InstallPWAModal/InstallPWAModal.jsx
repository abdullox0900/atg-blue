import { useEffect, useState } from 'react'
import { IoCloseOutline } from 'react-icons/io5'
import Logo from '../../assets/logo.png'

export default function InstallPWAModal({ onClose }) {
	const [isIOS, setIsIOS] = useState(false)
	const [deferredPrompt, setDeferredPrompt] = useState(null)

	useEffect(() => {
		// PWA ўрнатилганлигини текшириш
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			window.navigator.standalone

		// Агар PWA ўрнатилган бўлса модални ёпиш
		if (isStandalone) {
			onClose()
			return
		}

		// iOS қурилмасини аниқлаш
		const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
		setIsIOS(isIOSDevice)

		// PWA prompt ни кутиш
		window.addEventListener('beforeinstallprompt', e => {
			e.preventDefault()
			setDeferredPrompt(e)
		})
	}, [])

	const handleInstall = async () => {
		if (deferredPrompt) {
			deferredPrompt.prompt()
			const { outcome } = await deferredPrompt.userChoice
			if (outcome === 'accepted') {
				localStorage.setItem('pwa-installed', 'true')
				setDeferredPrompt(null)
				onClose()
			}
		}
	}

	return (
		<div
			className='fixed inset-0 bg-black/50 z-50'
			onClick={e => {
				if (e.target === e.currentTarget) onClose()
			}}
		>
			<div className='fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] p-6 transform transition-transform duration-300 ease-out'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-3'>
						<img src={Logo} alt='ATG Logo' className='h-8' />
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-full'
					>
						<IoCloseOutline size={24} />
					</button>
				</div>

				<div>
					<h3 className='text-xl font-bold mb-2'>Установите наше приложение</h3>

					<p className='text-gray-600 mb-[8px]'>
						Получите быстрый доступ к нашему сайту прямо с главного экрана
						вашего устройства!
					</p>
					<p className='text-gray-600 mb-[16px]'>
						Нажмите <span className='font-bold'>«Поделиться»</span> внизу экрана
						и <br />
						выберите{' '}
						<span className='font-bold'>«Добавить на экран Домой».</span>
					</p>

					{!isIOS && deferredPrompt && (
						<button
							onClick={handleInstall}
							className='w-full bg-[#004B89] text-white py-4 rounded-full text-lg font-medium hover:bg-[#003666] transition-colors'
						>
							Установить
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
