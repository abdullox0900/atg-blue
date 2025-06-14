import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useOrderDetails } from '../../hooks/useOrderDetails'
import { formatPrice } from '../../utils/formatters'

export default function OrderDetailsPage() {
	const navigate = useNavigate()
	const { orderId } = useParams()
	const { userData } = useAuth()
	const { orderDetails, isLoading, error } = useOrderDetails(orderId)

	if (isLoading) {
		return <div className='p-4'></div>
	}

	if (error || !orderDetails) {
		return <div className='p-4'></div>
	}

	console.log(orderDetails)

	const orderInfo = [
		{
			label: 'Количество литров',
			value: orderDetails.details['Количество литров'],
		},
		{
			label: 'Цена за литр',
			value: formatPrice(parseFloat(orderDetails.details['Цена за литр'])),
		},
		{
			label: 'Сумма',
			value: formatPrice(parseFloat(orderDetails.details['Сумма']).toFixed(0)),
		},
		{ label: 'Скидка', value: orderDetails.details['Скидка'] },
		{
			label:
				orderDetails.details['Скидка'] === 'да'
					? 'Сумма скидки'
					: 'Накопительный бонус (1%)',
			value:
				orderDetails.details['Скидка'] === 'да'
					? formatPrice(
							parseFloat(orderDetails.details['Сумма скидки'] || 0).toFixed(0)
					  )
					: formatPrice(
							parseFloat(
								orderDetails.details['Накопительный бонус (1%)'] || 0
							).toFixed(0)
					  ),
		},
		{
			label: 'К оплате',
			value: formatPrice(
				parseFloat(orderDetails.details['К оплате']).toFixed(0)
			),
		},
		{ label: 'Адрес доставки', value: orderDetails.details['Адрес доставки'] },
		{
			label: 'Статус',
			value: getStatusText(orderDetails.details['Статус']),
		},
	]

	return (
		<div className='p-4'>
			<div className='flex items-center mb-[37px]'>
				<div className='flex items-center'>
					<button
						onClick={() => navigate(-1)}
						className='p-2 -ml-2 text-[#004B89]'
					>
						<svg
							width={34}
							height={34}
							viewBox='0 0 34 34'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M7.4375 15.9375H28.6875C28.9693 15.9375 29.2395 16.0494 29.4388 16.2487C29.6381 16.448 29.75 16.7182 29.75 17C29.75 17.2818 29.6381 17.552 29.4388 17.7513C29.2395 17.9506 28.9693 18.0625 28.6875 18.0625H7.4375C7.15571 18.0625 6.88546 17.9506 6.6862 17.7513C6.48694 17.552 6.375 17.2818 6.375 17C6.375 16.7182 6.48694 16.448 6.6862 16.2487C6.88546 16.0494 7.15571 15.9375 7.4375 15.9375Z'
								fill='black'
							/>
							<path
								d='M7.87732 17.0001L16.6897 25.8104C16.8892 26.0099 17.0013 26.2805 17.0013 26.5626C17.0013 26.8448 16.8892 27.1154 16.6897 27.3149C16.4902 27.5144 16.2196 27.6265 15.9374 27.6265C15.6553 27.6265 15.3847 27.5144 15.1852 27.3149L5.6227 17.7524C5.52375 17.6537 5.44525 17.5364 5.39168 17.4073C5.33812 17.2783 5.31055 17.1399 5.31055 17.0001C5.31055 16.8604 5.33812 16.722 5.39168 16.5929C5.44525 16.4638 5.52375 16.3466 5.6227 16.2479L15.1852 6.68537C15.3847 6.48586 15.6553 6.37378 15.9374 6.37378C16.2196 6.37378 16.4902 6.48586 16.6897 6.68537C16.8892 6.88488 17.0013 7.15547 17.0013 7.43762C17.0013 7.71977 16.8892 7.99036 16.6897 8.18987L7.87732 17.0001Z'
								fill='black'
							/>
						</svg>
					</button>
				</div>
				<h1 className='text-[20px] font-bold text-center mx-auto'>
					{orderDetails.title}
				</h1>
			</div>

			<div className='bg-white'>
				{orderInfo.map((item, index) => (
					<div
						key={item.label}
						className={`flex justify-between py-[10px] px-6 ${
							index !== orderInfo.length - 1
								? 'border-b-[2px] border-[#D9D9D9]'
								: ''
						}`}
					>
						<span className='text-[20px] font-bold'>{item.label}:</span>
						<span
							className={`text-black text-[20px] ${
								item.label === 'Статус'
									? getStatusColor(item.value)
									: 'text-black text-[20px]'
							}`}
						>
							{item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}

function getStatusText(status) {
	switch (status?.toLowerCase()) {
		case 'pending':
			return 'В обработке'
		case 'confirmed':
			return 'Подтвержден'
		case 'completed':
			return 'Выполнен'
		case 'cancelled':
			return 'Отменен'
		default:
			return status
	}
}

function getStatusColor(status) {
	switch (status?.toLowerCase()) {
		case 'pending':
			return 'text-yellow-600'
		case 'confirmed':
			return 'text-blue-600'
		case 'completed':
			return 'text-green-600'
		case 'cancelled':
			return 'text-red-600'
		default:
			return 'text-gray-900'
	}
}
