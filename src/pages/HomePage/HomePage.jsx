import { NavLink } from 'react-router-dom'
import Contact from '../../components/Contact/Contact'
import Header from '../../components/Header/Header'
import PriceCard from '../../components/PriceCard/PriceCard'
import UserInfo from '../../components/UserInfo/UserInfo'
import { usePriceCards } from '../../hooks/usePriceCards'

export default function HomePage() {
	const { priceCards, isLoading, error } = usePriceCards()

	if (isLoading) {
		return (
			<div className='p-4 text-center'>
				<UserInfo />
				<div className='mt-8'>Загрузка...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='p-4 text-center'>
				<UserInfo />
				<div className='mt-8 text-red-500'>
					{error.message || 'Ошибка при получении данных цен'}
				</div>
			</div>
		)
	}

	return (
		<>
			<Header />
			<UserInfo />
			<div className='text-[20px] font-bold text-center py-4'>Тариф</div>

			<div className='grid grid-cols-1 gap-[27px] px-4 mb-8'>
				{Array.isArray(priceCards) && priceCards.length > 0 ? (
					priceCards.map((price, index) => (
						<PriceCard
							key={index}
							id={price.id}
							from={price.minLiters}
							to={price.maxLiters}
							price={price.pricePerLiter}
						/>
					))
				) : (
					<div className='col-span-2 text-center py-4'>
						Нет доступных тарифов
					</div>
				)}
			</div>

			<div className='flex flex-col gap-[18px] items-center justify-center px-4'>
				<NavLink
					to='/history'
					className='w-full text-center bg-[#0052A2] text-white py-[15px] px-[20px] rounded-[20px] text-[20px] font-normal'
				>
					История заказов
				</NavLink>
				<NavLink
					to='/support'
					className='w-full text-center bg-[#0052A2] text-white py-[15px] px-[20px] rounded-[20px] text-[20px] font-normal'
				>
					Техподдержка
				</NavLink>
			</div>

			<Contact />
		</>
	)
}
