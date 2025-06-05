import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MenuIcon from '../../assets/menu-icon.svg'
import BonusHistoryModal from '../../components/BonusHistoryModal/BonusHistoryModal'
import CustomSelect from '../../components/CustomSelect/CustomSelect'
import { useAuth } from '../../context/AuthContext'
import { useOrder } from '../../hooks/useOrder'
import { usePriceCards } from '../../hooks/usePriceCards'
import useUserStore from '../../store/userStore'
import { formatPrice } from '../../utils/formatters'
export default function OrderPage() {
	const navigate = useNavigate()
	const location = useLocation()
	const { isAuthenticated, userData } = useAuth()
	const { priceCards, isLoading: priceCardsLoading } = usePriceCards()

	const defaultVolume = location.state?.defaultVolume || 500
	const defaultPrice = location.state?.pricePerLiter || 30.9
	const priceCardId = location.state?.priceCardId
	const minVolume = location.state?.from || 200
	const maxVolume = location.state?.to || 2000

	const { user, addresses, fetchAddresses, addAddress } = useUserStore()
	const { submitOrder, isLoading: orderSubmitting } = useOrder()

	const [currentStep, setCurrentStep] = useState(1)
	const [volume, setVolume] = useState(defaultVolume)
	const [inputVolume, setInputVolume] = useState(String(defaultVolume))
	const [useDiscount, setUseDiscount] = useState(true)
	const [tankVolume, setTankVolume] = useState('')
	const [gasLeft, setGasLeft] = useState('')
	const [selectedAddress, setSelectedAddress] = useState('')
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [showBonusHistory, setShowBonusHistory] = useState(false)
	const [showAddAddress, setShowAddAddress] = useState(false)
	const [newAddress, setNewAddress] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState('')
	const [selectedTariff, setSelectedTariff] = useState(null)

	const rangeRef = useRef(null)

	// Define tariff options from API data
	const tariffOptions = useMemo(() => {
		if (priceCards && priceCards.length > 0) {
			return priceCards.map(card => ({
				id: card.id,
				from: card.minLiters,
				to: card.maxLiters,
				price: Number(card.pricePerLiter),
			}))
		}
		// Fallback if API data not loaded yet
		return [
			{ id: 1, from: 200, to: 500, price: 31.9 },
			{ id: 2, from: 500, to: 1000, price: 30.9 },
			{ id: 3, from: 1000, to: 2000, price: 27.9 },
		]
	}, [priceCards])

	useEffect(() => {
		fetchAddresses()
		// Set initial tariff based on default volume and price card from location state
		if (priceCardId) {
			setSelectedTariff(Number(priceCardId))
		} else {
			const initialTariff =
				tariffOptions.find(
					tariff => volume >= tariff.from && volume < tariff.to
				) || tariffOptions[0]
			setSelectedTariff(initialTariff.id)
		}
	}, [tariffOptions])

	// Get current price per liter based on selected tariff
	const pricePerLiter = useMemo(() => {
		const tariff = tariffOptions.find(t => t.id === selectedTariff)
		return tariff ? tariff.price : defaultPrice
	}, [selectedTariff, defaultPrice, tariffOptions])

	// Update tariff when volume changes
	useEffect(() => {
		const appropriateTariff = tariffOptions.find(
			tariff => volume >= tariff.from && volume < tariff.to
		)
		if (appropriateTariff && appropriateTariff.id !== selectedTariff) {
			setSelectedTariff(appropriateTariff.id)
		}
	}, [volume, tariffOptions])

	const totalPrice = volume * pricePerLiter

	// Handle volume input change - only allow whole numbers
	const handleVolumeChange = value => {
		// Remove any non-numeric characters
		const numericValue = value.replace(/[^0-9]/g, '')
		setInputVolume(numericValue)

		// Convert to number and validate
		const numValue = parseInt(numericValue, 10)
		if (!isNaN(numValue) && numValue >= minVolume && numValue <= maxVolume) {
			setVolume(numValue)
		}
	}

	// Бугунги кундаги 1% бонус - буни фақат кейинги харидда ишлатиш мумкин
	const todayBonus = Math.floor(totalPrice * 0.01)

	// Фақат олдинги кунлардаги бонусларни ишлатиш мумкин
	const availableBonus = userData?.balance
		? userData.bonuses
				?.filter(bonus => {
					const bonusDate = new Date(bonus.createdAt).setHours(0, 0, 0, 0)
					const today = new Date().setHours(0, 0, 0, 0)
					return bonusDate < today && !bonus.used
				})
				?.reduce((sum, bonus) => sum + Number(bonus.amount), 0) || 0
		: 0

	// Фақат олдинги бонусларни чегириш
	const finalPrice = useDiscount
		? totalPrice -
		  (availableBonus > 0 ? Math.min(availableBonus, totalPrice) : 0)
		: totalPrice

	const discountAmount =
		availableBonus > 0 ? Math.min(availableBonus, totalPrice) : 0

	const priceDisplayText = useDiscount
		? `Итого с учетом скидки: ${formatPrice(
				parseFloat(finalPrice).toFixed(0)
		  )} рублей`
		: `Итого: ${formatPrice(parseFloat(totalPrice).toFixed(0))} рублей`

	// Бонус маълумотини кўрсатиш
	const bonusText = useDiscount
		? `Использовано бонусов: ${formatPrice(discountAmount)} руб.`
		: `Будет начислено: ${formatPrice(todayBonus)} руб.`

	const handleSubmit = async () => {
		setError('')
		setIsSubmitting(true)

		try {
			if (!selectedAddress) {
				setError('Выберите адрес доставки')
				return
			}

			if (!selectedTariff || !volume || !pricePerLiter) {
				setError('Не все обязательные поля заполнены')
				return
			}

			// Get user balance for potential discount
			const userBalance = userData?.balance ? parseFloat(userData.balance) : 0

			// Calculate available discount amount from user balance if using discount
			const discountToApply =
				useDiscount && userBalance > 0 ? Math.min(userBalance, totalPrice) : 0

			const orderData = {
				priceCardId: Number(selectedTariff),
				liters: Number(volume),
				pricePerLiter: Number(pricePerLiter),
				deliveryAddress:
					addresses.find(addr => addr.id === Number(selectedAddress))
						?.address || '',
				useBonus: useDiscount, // Whether to use the bonus/discount from balance
				bonusAmount: discountToApply, // Amount of bonus to apply if useBonus is true
				saveBonus: !useDiscount, // Whether to save 1% as bonus for future use
				...(tankVolume && { tankVolume: Number(tankVolume) }),
				...(gasLeft && { remainingGas: Number(gasLeft) }),
				...(paymentMethod && { paymentMethod: paymentMethod }),
			}

			console.log('Sending order data:', orderData) // For debugging

			const result = await submitOrder(orderData)

			if (result.success) {
				setSuccessMessage('Заказ успешно создан')
				setTimeout(() => {
					navigate('/history')
				}, 2000)
			} else {
				setError(result.error || 'Ошибка при создании заказа')
			}
		} catch (error) {
			setError('Произошла ошибка при создании заказа')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleAddAddress = async () => {
		if (!newAddress.trim()) {
			setError('Введите адрес')
			return
		}

		const result = await addAddress(newAddress)
		if (result.success) {
			await fetchAddresses()
			setNewAddress('')
			setShowAddAddress(false)
			setSelectedAddress(result.data.id)
		} else {
			setError(result.error || 'Ошибка при добавлении адреса')
		}
	}

	const goToNextStep = () => {
		if (currentStep === 1) {
			if (!selectedAddress) {
				setError('Выберите адрес доставки')
				return
			}
			setError('')
		}

		if (currentStep < 3) {
			setCurrentStep(currentStep + 1)
		} else {
			handleSubmit()
		}
	}

	const goToPreviousStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	// Step 1: Address and Tank info
	const renderStep1 = () => (
		<>
			<h1 className='text-[20px] font-bold mb-6 text-center flex items-center justify-between gap-2'>
				<img src={MenuIcon} alt='Menu Icon' />
				<div className='mr-[15px]'>Оформление заказа</div>
				<div></div>
			</h1>

			<div className='flex flex-col'>
				<div className='mb-[19px]'>
					<div className='flex items-center justify-between mb-4'>
						<label className='text-[20px] font-bold block mb-2 max-[365px]:text-[16px]'>
							Адрес доставки:
						</label>
						<button
							onClick={() => setShowAddAddress(true)}
							className='text-[#004B89] text-sm underline'
						>
							Добавить новый адрес
						</button>
					</div>

					{showAddAddress ? (
						<div className='mb-4'>
							<div className='flex gap-2 mb-4'>
								<input
									type='text'
									value={newAddress}
									onChange={e => setNewAddress(e.target.value)}
									placeholder='Введите новый адрес'
									className='flex-1 p-4 rounded-lg bg-[#EBEBEB] text-lg'
								/>
								<button
									onClick={handleAddAddress}
									className='bg-[#004B89] text-white px-4 rounded-lg'
								>
									Добавить
								</button>
							</div>
							<button
								onClick={() => {
									setShowAddAddress(false)
									setNewAddress('')
								}}
								className='text-gray-500 text-sm'
							>
								Отмена
							</button>
						</div>
					) : (
						<>
							<CustomSelect
								value={selectedAddress}
								onChange={setSelectedAddress}
								options={addresses}
								placeholder='Выберите адрес'
							/>
							{addresses?.length === 0 && (
								<p className='text-sm text-red-500 mt-1 max-[365px]:text-[14px]'>
									Добавьте адрес для оформления заказа
								</p>
							)}
						</>
					)}
				</div>
			</div>

			<div className='mb-8'>
				<div className='flex items-center justify-between mb-[14px]'>
					<label className='text-[20px] font-bold max-[365px]:text-[16px]'>
						Объем резервуара:
					</label>
					<div className='flex items-center gap-[17px]'>
						<input
							type='number'
							value={tankVolume}
							onChange={e => setTankVolume(e.target.value)}
							className='w-[141px] text-[16px] font-bold rounded-[20px] p-4 bg-[#E3EEFD] outline-none'
						/>
						<span className='text-[20px] font-bold max-[365px]:text-[16px]'>
							м³
						</span>
					</div>
				</div>

				<div className='flex items-center justify-between'>
					<label className='text-[20px] font-bold max-[365px]:text-[16px]'>
						Остаток газа:
					</label>
					<div className='flex items-center gap-[17px]'>
						<input
							type='number'
							value={gasLeft}
							onChange={e => setGasLeft(e.target.value)}
							className='w-[141px] text-[16px] font-bold rounded-[20px] p-4 bg-[#E3EEFD] outline-none'
						/>
						<span className='text-[20px] font-bold max-[365px]:text-[16px]'>
							%
						</span>
					</div>
				</div>
			</div>
		</>
	)

	// Step 2: Volume and Payment options
	const renderStep2 = () => {
		const selectedAddressText =
			addresses.find(addr => addr.id === Number(selectedAddress))?.address || ''

		return (
			<>
				<div className='mb-6'>
					<h1 className='text-[20px] font-bold mb-6 text-center flex items-center justify-between gap-2'>
						<img src={MenuIcon} alt='Menu Icon' />
						<div className='mr-[15px]'>Оформление заказа</div>
						<div></div>
					</h1>
					<div className='border-b-[2px] border-[#D9D9D9] pb-4 mb-4'>
						<h3 className='text-[20px] font-bold text-center mb-1'>
							Адрес доставки: {selectedAddressText}
						</h3>
					</div>

					<h2 className='text-[20px] font-bold mb-4 text-center'>
						Способ оплаты
					</h2>

					<CustomSelect
						value={paymentMethod}
						onChange={setPaymentMethod}
						options={[
							{ id: 'cash', address: 'Наличные' },
							{ id: 'card', address: 'Банковская карта' },
							{ id: 'online', address: 'Онлайн оплата' },
						]}
						placeholder='Выберите способ оплаты'
					/>
				</div>

				<h2 className='text-[20px] font-bold mb-4 text-center'>Тариф</h2>

				{priceCardsLoading ? (
					<div className='text-center py-4'>Загрузка тарифов...</div>
				) : (
					<div className='mb-[33px]'>
						<div className='flex flex-col gap-[27px] mb-[33px]'>
							{tariffOptions.map(tariff => (
								<div
									key={tariff.id}
									onClick={() => setSelectedTariff(tariff.id)}
									className={`flex items-center justify-between text-[20px] rounded-lg cursor-pointer max-[375px]:text-[16px] ${
										selectedTariff === tariff.id
											? 'text-[#0052A2]'
											: 'text-[#000000]'
									}`}
								>
									<div className='flex items-center gap-3'>
										<div
											className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
												selectedTariff === tariff.id
													? 'border-[#0052A2] bg-[#0052A2]'
													: 'border-[#E3EEFD] bg-[#E3EEFD]'
											}`}
										>
											{selectedTariff === tariff.id && (
												<div className='w-3 h-3 rounded-full bg-[#0052A2]'></div>
											)}
										</div>
										<span>
											от {tariff.from} до {tariff.to} литров
										</span>
									</div>
									<span>
										{Number(tariff.price).toFixed(2).replace('.', ',')} р./л
									</span>
								</div>
							))}
						</div>

						<div className='mb-4'>
							<div className='text-[20px] font-bold mb-[27px] text-center'>
								Стоимость/объем
							</div>
							<div className='flex items-center justify-between gap-[12px]'>
								<div className=' w-[170px] font-bold text-center text-[20px] bg-[#E3EEFD] rounded-[20px] p-[15px]'>
									{formatPrice(totalPrice)} р.
								</div>
								<span className='text-[20px]'>=</span>
								<div className='flex justify-center font-bold w-[170px] bg-[#E3EEFD] rounded-[20px] p-[15px]'>
									<input
										type='text'
										className='w-full bg-transparent text-center text-[20px] outline-none'
										value={inputVolume}
										onChange={e => handleVolumeChange(e.target.value)}
										placeholder='100, 200, 300...'
										inputMode='numeric'
										pattern='[0-9]*'
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className='mb-6'>
					<div className='flex flex-col gap-[28px] mb-[33px]'>
						<div
							onClick={() => setUseDiscount(true)}
							className={`flex items-center justify-between rounded-lg cursor-pointer ${
								useDiscount ? 'text-[#0052A2]' : 'text-[#000000]'
							}`}
						>
							<div className='flex items-center gap-[16px]'>
								<div
									className={`w-[28px] h-[28px] rounded-full flex items-center justify-center border-2 ${
										useDiscount
											? 'border-[#0052A2] bg-[#0052A2]'
											: 'border-[#E3EEFD] bg-[#E3EEFD]'
									}`}
								>
									{useDiscount && (
										<div className='w-3 h-3 rounded-full bg-[#0052A2]'></div>
									)}
								</div>
								<span className='text-[20px] max-[365px]:text-[16px]'>
									Воспользоваться скидкой
								</span>
							</div>
						</div>

						<div
							onClick={() => setUseDiscount(false)}
							className={`flex items-center justify-between rounded-lg cursor-pointer ${
								!useDiscount ? 'text-[#0052A2]' : 'text-[#000000]'
							}`}
						>
							<div className='flex items-center gap-[16px]'>
								<div
									className={`w-[28px] h-[28px] rounded-full flex items-center justify-center border-2 ${
										!useDiscount
											? 'border-[#0052A2] bg-[#0052A2]'
											: 'border-[#E3EEFD] bg-[#E3EEFD]'
									}`}
								>
									{!useDiscount && (
										<div className='w-3 h-3 rounded-full bg-[#0052A2]'></div>
									)}
								</div>
								<span className='text-[20px] max-[365px]:text-[16px]'>
									Копить скидку
								</span>
							</div>
						</div>
					</div>
				</div>
			</>
		)
	}

	// Step 3: Order confirmation
	const renderStep3 = () => {
		const selectedTariffInfo =
			tariffOptions.find(t => t.id === selectedTariff) || {}
		const selectedAddressText =
			addresses.find(addr => addr.id === Number(selectedAddress))?.address || ''

		// Get user balance for discount
		const userBalance = userData?.balance ? parseFloat(userData.balance) : 0

		// Calculate available discount amount from user balance
		const availableDiscountAmount =
			useDiscount && userBalance > 0 ? Math.min(userBalance, totalPrice) : 0

		// Always use 1% for discount display
		const discountPercent = 1

		// Calculate 1% of total for both options
		const discountAmount = Math.round(totalPrice * 0.01)

		// Final price after applying discount (if using discount)
		const finalAmount = totalPrice - availableDiscountAmount

		return (
			<>
				<h1 className='text-[20px] font-bold mb-6 text-center flex items-center justify-between gap-2'>
					<img src={MenuIcon} alt='Menu Icon' />
					<div className='mr-[15px]'>Подтверждение заказа</div>
					<div></div>
				</h1>

				<div className='flex flex-col gap-5 mb-8'>
					<div className='flex justify-between items-center'>
						<span className='text-[20px]'>Сумма:</span>
						<span className='text-[20px] font-bold'>
							{formatPrice(totalPrice)} рублей
						</span>
					</div>

					<div className='flex justify-between items-center'>
						<span className='text-[20px]'>Объем:</span>
						<span className='text-[20px] font-bold'>{volume} литров</span>
					</div>

					<div className='flex justify-between items-center'>
						<span className='text-[20px]'>Скидка:</span>
						<span className='text-[20px] font-bold'>
							1% ({formatPrice(discountAmount)} рубля)
						</span>
					</div>

					<div className='flex justify-between items-center'>
						<span className='text-[20px]'>Адрес доставки:</span>
						<span className='text-[20px] font-bold'>{selectedAddressText}</span>
					</div>

					{paymentMethod && (
						<div className='flex justify-between items-center'>
							<span className='text-[20px]'>Способ оплаты:</span>
							<span className='text-[20px] font-bold'>
								{paymentMethod === 'cash'
									? 'Наличные'
									: paymentMethod === 'card'
									? 'Банковская карта'
									: paymentMethod === 'online'
									? 'Онлайн оплата'
									: ''}
							</span>
						</div>
					)}
				</div>

				<div className='bg-[#E3EEFD] p-4 rounded-[20px] mb-6'>
					<p className='text-[20px] text-[#0052A2] text-center font-bold'>
						{useDiscount
							? `Итого с учетом скидки: ${formatPrice(finalAmount)} рубля`
							: `Итого: ${formatPrice(totalPrice)} рубля`}
					</p>
				</div>
			</>
		)
	}

	if (priceCardsLoading && currentStep === 2) {
		return (
			<div className='p-4 text-center'>
				<h1 className='text-[20px] font-bold mb-6'>Загрузка тарифов...</h1>
			</div>
		)
	}

	return (
		<div className='p-4 mb-[30px]'>
			{/* Step content */}
			{currentStep === 1 && renderStep1()}
			{currentStep === 2 && renderStep2()}
			{currentStep === 3 && renderStep3()}

			{error && (
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
					{error}
				</div>
			)}
			{successMessage && (
				<div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4'>
					{successMessage}
				</div>
			)}

			{/* Navigation buttons */}
			<div className='flex justify-between mt-6'>
				<button
					onClick={goToNextStep}
					disabled={isSubmitting}
					className='bg-[#0052A2] w-full text-white py-[15px] px-6 rounded-[20px] text-[18px] disabled:opacity-50'
				>
					{currentStep < 3
						? 'Далее'
						: isSubmitting
						? 'Оформление...'
						: 'Оформить'}
				</button>
			</div>

			{showBonusHistory && (
				<BonusHistoryModal onClose={() => setShowBonusHistory(false)} />
			)}
		</div>
	)
}
