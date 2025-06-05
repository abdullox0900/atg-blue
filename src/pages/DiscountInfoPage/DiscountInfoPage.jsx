import { useNavigate } from 'react-router-dom'

export default function DiscountInfoPage() {
	const navigate = useNavigate()

	return (
		<div className='p-4'>
			<div className='flex items-center mb-6'>
				<button
					onClick={() => navigate(-1)}
					className='p-2 -ml-2 text-[#004B89]'
				>
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
				<h1 className='text-xl font-medium'>О скидочной системе</h1>
			</div>

			<div className='space-y-6'>
				<div>
					<h2 className='text-xl font-bold mb-4'>Условия начисления скидки</h2>
					<ol className='list-decimal pl-6 space-y-4 text-[20px] leading-[20px]'>
						<li>
							При регистрации Вам предоставляется скидка в размере 1 000 рублей
							при первом заказе.
						</li>
						<li>
							При следующем каждом заказе Вам предоставляется скидка в размере
							1% от суммы выполненного заказа при расчете по факту.
						</li>
					</ol>
				</div>

				<div>
					<h2 className='text-xl font-bold mb-4'>Условия списания скидки</h2>
					<ol className='list-decimal pl-6 space-y-4 text-[20px] leading-[20px]'>
						<li>
							Скидку (в размере 1% от суммы) Вы можете применить при каждом
							выполненном заказе при условии «воспользоваться скидкой».
						</li>
						<li>
							При условии «копить скидку» Вы можете накопить скидку и при
							последующих заказах воспользоваться общей накопленной суммой (в
							размере 1% от суммы)
						</li>
					</ol>
				</div>
			</div>
		</div>
	)
}
