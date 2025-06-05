import { NavLink } from 'react-router-dom'

export default function BottomNav() {
	return (
		<div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200'>
			<div className='max-w-4xl mx-auto'>
				<div className='flex justify-around py-3'>
					<NavLink
						to='/'
						className={({ isActive }) =>
							`flex flex-col items-center ${
								isActive ? 'text-[#1e4b87]' : 'text-gray-500'
							}`
						}
					>
						<span>Главная</span>
					</NavLink>
					<NavLink
						to='/history'
						className={({ isActive }) =>
							`flex flex-col items-center ${
								isActive ? 'text-[#1e4b87]' : 'text-gray-500'
							}`
						}
					>
						<span>История заказов</span>
					</NavLink>
					<NavLink
						to='/profile'
						className={({ isActive }) =>
							`flex flex-col items-center ${
								isActive ? 'text-[#1e4b87]' : 'text-gray-500'
							}`
						}
					>
						<span>Профиль</span>
					</NavLink>
				</div>
			</div>
		</div>
	)
}
