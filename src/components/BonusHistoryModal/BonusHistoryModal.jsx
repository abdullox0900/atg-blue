import { useEffect, useState } from 'react'
import { IoCloseOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { fetcher } from '../../utils/fetcher'
import { formatPrice } from '../../utils/formatters'

export default function BonusHistoryModal({ onClose }) {
	const navigate = useNavigate()
	const [history, setHistory] = useState([])
	const [balance, setBalance] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const response = await fetcher('/bonus/history')
				if (response.status === 'success') {
					setHistory(response.data.history)
					setBalance(parseFloat(response.data.stats.balance))
				} else {
					setError('Ошибка при получении истории бонусов')
				}
			} catch (err) {
				setError(err.message || 'Ошибка при загрузке данных')
			} finally {
				setIsLoading(false)
			}
		}

		fetchHistory()
	}, [])

	const handleViewDetails = orderId => {
		onClose()
		navigate(`/order/${orderId}`)
	}

	const getBonusStyle = item => {
		if (item.isCancelled) {
			return 'bg-red-50 border border-red-100'
		}
		if (item.isCompleted) {
			return 'bg-green-50 border border-green-100'
		}
		return 'bg-gray-50'
	}

	return (
		<div
			className='fixed inset-0 bg-black/50 z-50'
			onClick={e => {
				if (e.target === e.currentTarget) onClose()
			}}
		>
			<div className='fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] p-6 max-h-[80vh] overflow-y-auto'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-xl font-bold'>История бонусов</h3>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-full'
					>
						<IoCloseOutline size={24} />
					</button>
				</div>

				{isLoading ? (
					<div className='text-center py-4'>Загрузка...</div>
				) : error ? (
					<div className='text-red-500 text-center py-4'>{error}</div>
				) : history.length > 0 ? (
					<>
						{/* <div className='bg-gray-50 p-4 rounded-lg mb-4 text-center'>
							<p className='text-sm text-gray-600'>Текущий баланс</p>
							<p className='font-bold text-[#004B89]'>
								{parseFloat(formatPrice(balance)).toFixed(0)} ₽
							</p>
						</div> */}
						<div className='space-y-3'>
							{history.map(item => (
								<div
									key={item.id}
									className={`p-4 rounded-lg ${getBonusStyle(item)}`}
								>
									<div className='flex items-center justify-between mb-2'>
										<div>
											<p className='text-sm text-gray-500'>{item.date}</p>
											<p className='text-sm text-gray-600'>
												{item.orderId ? `Заказ №${item.orderId}` : ''}
											</p>
										</div>
										<p
											className={`font-bold ${
												item.type === '+' ? 'text-green-600' : 'text-red-600'
											}`}
										>
											{item.type}
											{formatPrice(parseFloat(item.amount).toFixed(0))} ₽
										</p>
									</div>
									{item.orderStatus && (
										<div className='flex items-center justify-between mt-2'>
											<p
												className={`text-sm ${
													item.isCancelled
														? 'text-red-600'
														: item.isCompleted
														? 'text-green-600'
														: 'text-gray-600'
												}`}
											>
												{item.orderStatus}
											</p>
											<button
												onClick={() => handleViewDetails(item.orderId)}
												className='text-sm text-[#004B89] underline'
											>
												Подробнее
											</button>
										</div>
									)}
								</div>
							))}
						</div>
					</>
				) : (
					<p className='text-center text-gray-500 py-4'>
						У вас пока нет бонусов
					</p>
				)}
			</div>
		</div>
	)
}
