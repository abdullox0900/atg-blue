import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../utils/formatters'
import BonusHistoryModal from '../BonusHistoryModal/BonusHistoryModal'

export default function UserInfo() {
	const { isAuthenticated, userData } = useAuth()
	const [showBonusHistory, setShowBonusHistory] = useState(false)

	const NotAuthenticatedView = () => (
		<div className='text-center mt-[10px] mb-[25px] px-[16px]'>
			<h1 className='text-2xl font-bold mb-[23px] max-[365px]:text-[20px]'>
				Доставка сжиженного газа
			</h1>
			<div className='bg-[#A41A18] text-white py-[14px] px-[42px] rounded-[20px] max-w-sm mx-auto'>
				<p className='text-[18px] leading-[20px] mb-4 max-[355px]:text-[14px]'>
					Войдите или зарегистрируйтесь для заказа и начисления бонусов
				</p>
				<div className='flex gap-3 justify-center'>
					<Link
						to='/login'
						className='flex-1 bg-white text-[#A41A18] py-2 px-4 rounded-full text-base font-medium hover:bg-gray-100 transition-colors max-[355px]:text-[12px]'
					>
						Войти
					</Link>
					<Link
						to='/register'
						className='flex-1 bg-white text-[#A41A18] py-2 px-4 rounded-full text-base font-medium hover:bg-gray-100 transition-colors max-[355px]:text-[12px]'
					>
						Регистрация
					</Link>
				</div>
			</div>
		</div>
	)

	const AuthenticatedView = () => (
		<div className='text-center mb-6 px-[16px]'>
			<h1 className='text-2xl font-bold mb-[20px] max-[365px]:text-[20px]'>
				Доставка сжиженного газа
			</h1>

			<div
				className='text-white py-[14px] px-[20px] rounded-[20px] w-full h-[191px] mx-auto mb-4 cursor-pointer balance-bg'
				onClick={() => setShowBonusHistory(true)}
			>
				<div className='text-[20px] font-bold mb-[22px]'>Ваш профиль</div>
				<div className='flex flex-col gap-[20px]'>
					<p className='text-[20px] font-light leading-[20px] text-start'>
						ID № {userData?.id}
					</p>
					<p className='text-[20px] font-light leading-[20px] text-start'>
						Баланс {formatPrice(parseFloat(userData?.balance).toFixed(0))} руб.
					</p>
					<div className='text-[20px] font-light leading-[20px] text-start'>
						Адрес доставки: {userData?.address}
					</div>
				</div>
			</div>

			{showBonusHistory && (
				<BonusHistoryModal onClose={() => setShowBonusHistory(false)} />
			)}
		</div>
	)

	return isAuthenticated ? <AuthenticatedView /> : <NotAuthenticatedView />
}
