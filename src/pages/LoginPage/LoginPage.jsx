import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [phone, setPhone] = useState('')
	const [code, setCode] = useState('')
	const [userId, setUserId] = useState(null)
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [step, setStep] = useState('phone') // 'phone' or 'code'

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

	const handlePhoneChange = e => {
		const value = e.target.value
		if (/^[0-9+() -]*$/.test(value)) {
			const formattedNumber = formatPhoneNumber(value)
			setPhone(formattedNumber)
			setError('')
		}
	}

	const handlePhoneSubmit = async e => {
		e.preventDefault()
		if (!phone) {
			setError('Введите номер телефона')
			return
		}

		setIsLoading(true)
		setError('')

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/auth/login`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						phone: getApiPhoneFormat(phone),
					}),
				}
			)

			const data = await response.json()

			if (data.status === 'success') {
				setUserId(data.data.userId)
				setStep('code')
			} else {
				setError(data.message || 'Ошибка при входе')
			}
		} catch (err) {
			setError('Ошибка сервера')
		} finally {
			setIsLoading(false)
		}
	}

	const handleCodeSubmit = async e => {
		e.preventDefault()
		if (!code) {
			setError('Введите код подтверждения')
			return
		}

		setIsLoading(true)
		setError('')

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/auth/verify-code`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						userId,
						code,
					}),
				}
			)

			const data = await response.json()

			if (data.status === 'success') {
				login(data.token, data.data.user)
				navigate('/')
			} else {
				setError(data.message || 'Неверный код')
			}
		} catch (err) {
			setError('Ошибка сервера')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='p-4'>
			<div className='flex items-center mb-6' onClick={() => navigate(-1)}>
				<button className='w-10 h-10 p-2 -ml-2 text-[#004B89]'>
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
					{step === 'phone' ? 'Вход' : 'Подтверждение'}
				</h1>
			</div>

			{error && (
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
					{error}
				</div>
			)}

			{step === 'phone' ? (
				<form onSubmit={handlePhoneSubmit} className='flex flex-col gap-4'>
					<div className='flex flex-col gap-2'>
						<label className='text-sm font-medium'>Телефон</label>
						<input
							type='tel'
							value={phone}
							onChange={handlePhoneChange}
							placeholder='+7 (900) 123-45-67'
							className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg'
							maxLength={18}
						/>
					</div>

					<button
						type='submit'
						disabled={isLoading}
						className='bg-[#0052A2] text-white py-[15px] px-6 rounded-[20px] text-lg font-medium disabled:opacity-50'
					>
						{isLoading ? 'Проверка...' : 'Войти'}
					</button>
				</form>
			) : (
				<form onSubmit={handleCodeSubmit} className='flex flex-col gap-4'>
					<p className='text-center mb-4'>
						Мы отправили код подтверждения на номер
						<br />
						<span className='font-bold'>{phone}</span>
					</p>

					<div className='flex flex-col gap-2'>
						<label className='text-sm font-medium'>Код из СМС</label>
						<input
							type='text'
							value={code}
							onChange={e => setCode(e.target.value)}
							placeholder='Введите код'
							className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg'
							maxLength={6}
						/>
					</div>

					<button
						type='submit'
						disabled={isLoading}
						className='bg-[#0052A2] text-white py-4 px-6 rounded-[20px] text-lg font-medium disabled:opacity-50'
					>
						{isLoading ? 'Проверка...' : 'Войти'}
					</button>
				</form>
			)}
		</div>
	)
}
