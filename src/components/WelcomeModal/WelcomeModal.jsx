import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LogoWelcome from '../../assets/logo.png'
import InstallPWAModal from '../InstallPWAModal/InstallPWAModal'

export default function WelcomeModal({ userName }) {
	const navigate = useNavigate()
	const [showInstallModal, setShowInstallModal] = useState(false)

	const handleContinue = () => {
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches
		const hasShownPWAPrompt = localStorage.getItem('pwa-prompt-shown')
		const isPWAInstalled = localStorage.getItem('pwa-installed')

		// PWA модални фақат биринчи марта кўрсатиш
		if (!isStandalone && !hasShownPWAPrompt && !isPWAInstalled) {
			setShowInstallModal(true)
			localStorage.setItem('pwa-prompt-shown', 'true')
		} else {
			navigate('/')
		}
	}

	return (
		<>
			<div className='fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4'>
				<img
					src={LogoWelcome}
					alt='ATG Logo'
					className='w-[150px] h-[128px] mb-10'
				/>

				<h2 className='text-[32px] leading-[30px] font-semibold mb-[25px] text-center'>
					Добрый день,
					<br />
					{userName}!
				</h2>

				<p className='text-[20px] font-medium leading-[24px] text-center mb-[45px] max-[360px]:text-[16px]'>
					Рады, что Вы присоединились к нам! Ваш первый заказ будет со скидкой
					1000 рублей, которые уже начислены на ваш счет!
				</p>

				<button
					onClick={handleContinue}
					className='bg-[#0052A2] text-white w-full py-[15px] px-16 rounded-[20px] text-[20px] leading-[20px]'
				>
					Продолжить
				</button>
			</div>

			{showInstallModal && (
				<InstallPWAModal
					onClose={() => {
						setShowInstallModal(false)
						navigate('/')
					}}
				/>
			)}
		</>
	)
}
