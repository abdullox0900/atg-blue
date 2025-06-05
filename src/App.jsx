import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import InstallPWAModal from './components/InstallPWAModal/InstallPWAModal'
import MobileToolbar from './components/MobileToolbar/MobileToolbar'
import { AuthProvider } from './context/AuthContext'
import DiscountInfoPage from './pages/DiscountInfoPage/DiscountInfoPage'
import DocumentsPage from './pages/DocumentsPage/DocumentsPage'
import HistoryPage from './pages/HistoryPage/HistoryPage'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import OrderDetailsPage from './pages/OrderDetailsPage/OrderDetailsPage'
import OrderPage from './pages/OrderPage/OrderPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import { initializeOneSignal } from './services/oneSignal'

export default function App() {
	const [showPWAPrompt, setShowPWAPrompt] = useState(false)
	const [isPWA, setIsPWA] = useState(false)

	useEffect(() => {
		// OneSignal инициализацияси
		const initOneSignal = async () => {
			if (!window.OneSignal?.initialized) {
				await initializeOneSignal()
			}
		}
		initOneSignal()
	}, [])

	useEffect(() => {
		const checkPWAStatus = () => {
			const isStandalone =
				window.matchMedia('(display-mode: standalone)').matches ||
				window.navigator.standalone
			setIsPWA(isStandalone)

			// PWA prompt кўрсатиш логикаси
			const hasShownPrompt = localStorage.getItem('pwa-prompt-shown')

			if (!isStandalone && !hasShownPrompt) {
				// Фақат биринчи марта кирганда кўрсатиш
				setTimeout(() => {
					setShowPWAPrompt(true)
				}, 2000) // 2 секунд кутиб туриш
			}

			if (isStandalone) {
				document.documentElement.style.setProperty(
					'--sat',
					'env(safe-area-inset-top)'
				)
				document.documentElement.style.setProperty(
					'--sab',
					'env(safe-area-inset-bottom)'
				)
			}
		}

		checkPWAStatus()
		window.matchMedia('(display-mode: standalone)').addListener(checkPWAStatus)
	}, [])

	return (
		<BrowserRouter>
			<AuthProvider>
				<div
					className={`max-w-4xl mx-auto relative ${
						isPWA
							? 'min-h-[100dvh] pb-[calc(96px+var(--sab,0px))] pt-[var(--sat,0px)]'
							: 'pb-24'
					}`}
				>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/documents' element={<DocumentsPage />} />
						<Route path='/login' element={<LoginPage />} />
						<Route path='/register' element={<RegisterPage />} />
						<Route path='/history' element={<HistoryPage />} />
						<Route path='/profile' element={<ProfilePage />} />
						<Route path='/order' element={<OrderPage />} />
						<Route path='/discount-info' element={<DiscountInfoPage />} />
						<Route path='/order/:orderId' element={<OrderDetailsPage />} />
					</Routes>
					<MobileToolbar isPWA={isPWA} />

					{showPWAPrompt && (
						<InstallPWAModal
							onClose={() => {
								setShowPWAPrompt(false)
								localStorage.setItem('pwa-prompt-shown', 'true')
							}}
						/>
					)}
				</div>
			</AuthProvider>
		</BrowserRouter>
	)
}
