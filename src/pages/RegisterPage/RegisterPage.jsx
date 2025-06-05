import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WelcomeModal from '../../components/WelcomeModal/WelcomeModal'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
	})
	const [verificationCode, setVerificationCode] = useState('')
	const [userId, setUserId] = useState(null)
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [showWelcome, setShowWelcome] = useState(false)
	const [isAgreed, setIsAgreed] = useState(false)
	const [step, setStep] = useState('register') // 'register' or 'verify'

	const validateForm = () => {
		if (!formData.name.trim()) {
			setError('Введите имя')
			return false
		}

		if (!formData.phone.trim()) {
			setError('Введите номер телефона')
			return false
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(formData.email)) {
			setError('Введите корректный email')
			return false
		}

		if (!formData.address.trim()) {
			setError('Введите адрес')
			return false
		}

		return true
	}

	const formatPhoneNumber = value => {
		const numbers = value.replace(/\D/g, '')
		const cleanNumbers = numbers.startsWith('7') ? numbers.slice(1) : numbers
		let formattedNumber = ''
		if (cleanNumbers.length > 0) {
			formattedNumber = '+7'
			if (cleanNumbers.length > 0) {
				formattedNumber += ` (${cleanNumbers.slice(0, 3)}`
			}
			if (cleanNumbers.length > 3) {
				formattedNumber += `) ${cleanNumbers.slice(3, 6)}`
			}
			if (cleanNumbers.length > 6) {
				formattedNumber += `-${cleanNumbers.slice(6, 8)}`
			}
			if (cleanNumbers.length > 8) {
				formattedNumber += `-${cleanNumbers.slice(8, 10)}`
			}
		}
		return formattedNumber
	}

	const getApiPhoneFormat = phone => {
		const numbers = phone.replace(/\D/g, '')
		return numbers.startsWith('7') ? `+${numbers}` : `+7${numbers}`
	}

	const handleChange = e => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
		setError('')
	}

	const handlePhoneChange = e => {
		const value = e.target.value
		if (/^[0-9+() -]*$/.test(value)) {
			const formattedNumber = formatPhoneNumber(value)
			setFormData(prev => ({ ...prev, phone: formattedNumber }))
			setError('')
		}
	}

	const handleRegister = async e => {
		e.preventDefault()
		if (!validateForm() || !isAgreed) return

		setIsLoading(true)
		setError('')

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/auth/register`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						...formData,
						phone: getApiPhoneFormat(formData.phone),
					}),
				}
			)

			const data = await response.json()

			if (data.status === 'success') {
				setUserId(data.data.userId)
				setStep('verify')
			} else {
				setError(data.message || 'Ошибка при регистрации')
			}
		} catch (err) {
			setError('Ошибка сервера')
		} finally {
			setIsLoading(false)
		}
	}

	const handleVerify = async e => {
		e.preventDefault()
		if (!verificationCode) {
			setError('Введите код подтверждения')
			return
		}

		setIsLoading(true)
		setError('')

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/auth/verify-registration`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						userId,
						code: verificationCode,
					}),
				}
			)

			const data = await response.json()
			console.log('Verification response:', data) // Debug log

			if (data.status === 'success' && data.token && data.data?.user) {
				// Токен ва фойдаланувчи маълумотларини сақлаш
				localStorage.setItem('token', data.token)
				login(data.token, data.data.user)
				setShowWelcome(true)
			} else {
				setError(data.message || 'Неверный код подтверждения')
			}
		} catch (err) {
			console.error('Verification error:', err)
			setError('Ошибка сервера')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<>
			{showWelcome ? (
				<WelcomeModal userName={formData.name} />
			) : (
				<div className='p-4'>
					<div className='flex items-center mb-6' onClick={() => navigate(-1)}>
						<button className='p-2 -ml-2 text-[#004B89]'>
							<svg
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M15 18L9 12L15 6'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</button>
						<h1 className='text-xl font-medium text-center flex-1 -ml-8'>
							{step === 'register' ? 'Регистрация' : 'Подтверждение'}
						</h1>
					</div>

					{error && (
						<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
							{error}
						</div>
					)}

					{step === 'register' ? (
						<form onSubmit={handleRegister} className='flex flex-col gap-4'>
							<div className='flex flex-col gap-2'>
								<label className='text-sm font-medium'>Имя</label>
								<input
									type='text'
									name='name'
									value={formData.name}
									onChange={handleChange}
									placeholder='Иван'
									className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg'
								/>
							</div>

							<div className='flex flex-col gap-2'>
								<label className='text-sm font-medium'>Телефон</label>
								<input
									type='tel'
									name='phone'
									value={formData.phone}
									onChange={handlePhoneChange}
									placeholder='+7 (900) 123-45-67'
									className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg'
								/>
							</div>

							<div className='flex flex-col gap-2'>
								<label className='text-sm font-medium'>E-mail</label>
								<input
									type='email'
									name='email'
									value={formData.email}
									onChange={handleChange}
									placeholder='info@mail.ru'
									className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg'
								/>
							</div>

							<div className='flex flex-col gap-2'>
								<label className='text-sm font-medium'>Адрес</label>
								<input
									type='text'
									name='address'
									value={formData.address}
									onChange={handleChange}
									placeholder='Садовая, 5'
									className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg'
								/>
							</div>

							<label className='flex items-center justify-center gap-2 mt-[35px]'>
								<input
									type='checkbox'
									checked={isAgreed}
									onChange={e => setIsAgreed(e.target.checked)}
									className='w-5 h-5 accent-[#0052A2]'
								/>
								<span className='text-sm font-medium'>
									Согласие на обработку персональных данных
								</span>
							</label>

							<button
								type='submit'
								disabled={isLoading || !isAgreed}
								className='bg-[#0052A2] text-white py-[15px] px-6 rounded-[20px] mt-[30px] text-sm font-medium disabled:opacity-50'
							>
								{isLoading ? 'Загрузка...' : 'Продолжить'}
							</button>
						</form>
					) : (
						<form onSubmit={handleVerify} className='flex flex-col gap-4'>
							<p className='text-center mb-4'>
								Мы отправили код подтверждения на номер
								<br />
								<span className='font-bold'>{formData.phone}</span>
							</p>

							<div className='flex flex-col gap-2'>
								<label className='text-sm font-medium'>Код из СМС</label>
								<input
									type='text'
									value={verificationCode}
									onChange={e => setVerificationCode(e.target.value)}
									placeholder='Введите код'
									className='w-full p-4 py-[15px] rounded-[20px] bg-[#E3EEFD] text-lg'
									maxLength={6}
								/>
							</div>

							<button
								type='submit'
								disabled={isLoading}
								className='bg-[#0052A2] text-white py-[15px] px-6 rounded-[20px] text-sm font-medium disabled:opacity-50'
							>
								{isLoading ? 'Проверка...' : 'Подтвердить'}
							</button>
						</form>
					)}
				</div>
			)}
		</>
	)
}
