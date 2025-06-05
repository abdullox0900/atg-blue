import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BonusHistoryModal from '../../components/BonusHistoryModal/BonusHistoryModal'
import { useAuth } from '../../context/AuthContext'
import { useOrder } from '../../hooks/useOrder'
import { formatPrice } from '../../utils/formatters'

// Статус рангларини белгилаш
const getStatusStyle = status => {
	switch (status?.toLowerCase()) {
		case 'выполнен':
			return 'bg-green-100 text-green-800 border border-green-200'
		case 'в обработке':
			return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
		case 'отменен':
			return 'bg-red-100 text-red-800 border border-red-200'
		default:
			return 'bg-gray-100 text-gray-800 border border-gray-200'
	}
}

export default function HistoryPage() {
	const { isAuthenticated, userData } = useAuth()
	const { orders, isLoading, error } = useOrder()
	const navigate = useNavigate()
	const [showBonusHistory, setShowBonusHistory] = useState(false)

	if (!isAuthenticated) {
		return (
			<div className='text-center p-4'>
				<h1 className='text-2xl font-bold mb-6'>История заказов</h1>
				<div className='bg-[#A41A18] text-white py-[14px] px-[42px] rounded-[20px] max-w-sm mx-auto'>
					<p className='text-[18px] leading-[20px] mb-4'>
						Войдите или зарегистрируйтесь для заказа и начисления бонусов
					</p>
					<div className='flex gap-3 justify-center'>
						<Link
							to='/login'
							className='flex-1 bg-white text-[#A41A18] py-2 px-4 rounded-full text-base font-medium hover:bg-gray-100 transition-colors'
						>
							Войти
						</Link>
						<Link
							to='/register'
							className='flex-1 bg-white text-[#A41A18] py-2 px-4 rounded-full text-base font-medium hover:bg-gray-100 transition-colors'
						>
							Регистрация
						</Link>
					</div>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className='p-4'>
				<div className='bg-[#004B89] text-white py-[14px] px-8 rounded-full max-w-sm mx-auto mb-8'>
					<p className='text-[20px] font-light leading-[20px] text-center'>
						ID № {userData?.id}
					</p>
					<p className='text-[20px] font-light leading-[20px] text-center'>
						Баланс {formatPrice(parseFloat(userData?.balance).toFixed(0))} руб.
					</p>
				</div>
				<div className='text-center'>Загрузка...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='p-4'>
				<div className='bg-[#004B89] text-white py-[14px] px-8 rounded-full max-w-sm mx-auto mb-8'>
					<p className='text-[20px] font-light leading-[20px] text-center'>
						ID № {userData?.id}
					</p>
					<p className='text-[20px] font-light leading-[20px] text-center'>
						Баланс {formatPrice(parseFloat(userData?.balance).toFixed(0))} руб.
					</p>
				</div>
				<div className='text-center text-red-500'>
					{error.message || 'Ошибка при получении истории заказов'}
				</div>
			</div>
		)
	}

	return (
		<div className='p-4'>
			<div className='text-[20px] font-bold text-center mb-[20px]'>
				История заказов
			</div>
			{orders.length === 0 ? (
				<div className='text-center pb-8'>
					<p className='text-gray-500'>У вас пока нет заказов</p>
					<button
						onClick={() => navigate('/')}
						className='w-full mt-4 bg-[#0052A2] text-white py-[15px] px-6 rounded-[20px]'
					>
						Сделать заказ
					</button>
				</div>
			) : (
				<div className='overflow-x-auto'>
					<ul className='flex justify-between border-b-[3px] border-[#D9D9D9] mb-[16px]'>
						<li className='text-left py-[10px] font-bold text-[20px]'>Дата</li>
						<li className='text-center py-[10px] pl-[20px] font-bold text-[20px]'>
							Статус
						</li>
						<li className='text-right py-[10px] font-bold text-[20px]'>
							Действие
						</li>
					</ul>
					<ul className='flex flex-col gap-[20px]'>
						{orders.map(order => (
							<li key={order.id} className='flex justify-between items-center'>
								<p>{order.date}</p>
								<p
									className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(
										order.status
									)}`}
								>
									{order.status}
								</p>
								<button
									onClick={() => navigate(`/order/${order.id}`)}
									className='text-[#004B89] underline'
								>
									подробнее
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{showBonusHistory && (
				<BonusHistoryModal onClose={() => setShowBonusHistory(false)} />
			)}
		</div>
	)
}
