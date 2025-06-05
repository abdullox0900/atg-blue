import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PriceCard({ id, from, to, price }) {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()

	const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price

	const handleOrder = () => {
		if (!isAuthenticated) {
			navigate('/login')
			return
		}

		navigate('/order', {
			state: {
				priceCardId: id,
				pricePerLiter: price,
				defaultVolume: from,
				from: from,
				to: to,
			},
		})
	}

	return (
		<div
			className='flex items-center justify-between text-center'
			onClick={handleOrder}
		>
			<div className='flex items-center'>
				<span className='w-[28px] h-[28px] mr-[16px] bg-[#E3EEFD] rounded-full'></span>
				<p className='text-[20px] max-[425px]:text-[18px] max-[390px]:text-[16px] max-[350px]:text-[14px]'>
					от {from} до {to}
				</p>
				<p className='text-lg max-[390px]:text-[12px]'>литров</p>
			</div>
			<p className='text-xl font-normal max-[390px]:text-[16px]'>
				{formattedPrice} р./л
			</p>
		</div>
	)
}
