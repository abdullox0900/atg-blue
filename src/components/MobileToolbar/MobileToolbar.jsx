import { BsFillInboxFill, BsQrCode } from 'react-icons/bs'
import { GoHomeFill } from 'react-icons/go'
import { MdOutlineMoreHoriz } from 'react-icons/md'
import { PiSealPercentFill } from 'react-icons/pi'
import { NavLink, useLocation } from 'react-router-dom'

export default function MobileToolbar({ isPWA }) {
	const location = useLocation()
	const isProfileActive = [
		'/profile',
		'/login',
		'/register',
		'/discount-info',
	].includes(location.pathname)

	const isHomeActive = ['/', '/order'].includes(location.pathname)

	const navItems = [
		{
			to: '/',
			icon: GoHomeFill,
			label: 'Профиль',
			isActive: isProfileActive,
		},
		{
			to: '/history',
			icon: BsFillInboxFill,
			label: 'История',
		},
		{
			to: '/qrcode',
			icon: BsQrCode,
			label: '',
			className:
				'absolute w-[77px] h-[77px] bg-[#0052A2] rounded-full p-3 -mt-14 text-white border border-[1px] border-[#DBDBDB] z-10 after:content-[""] after:absolute after:top-0 after:left-0 after:w-[75px] after:h-[75px] after:border-[4px] after:border-white after:rounded-full after:z-[100]',
		},
		{
			to: '/actions',
			icon: PiSealPercentFill,
			label: 'Акции',
		},
		{
			to: '/profile',
			icon: MdOutlineMoreHoriz,
			label: 'Еще',
			isActive: isHomeActive,
		},
	]

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 bg-white ${
				isPWA ? 'mb-[var(--sab,0px)]' : ''
			}`}
		>
			<div className='rounded-t-[10px] border-t-[1px] border-x-[1px] border-[#DBDBDB] py-[11px] px-[20px]'>
				<div className='flex justify-between items-center'>
					{navItems.map(
						({ to, icon: Icon, label, isActive: forceActive, className }) => (
							<NavLink
								key={to}
								to={to}
								className='relative flex flex-col items-center'
							>
								{({ isActive }) => (
									<>
										<div
											className={`relative flex items-center justify-center ${
												isActive || forceActive
													? 'text-gray-700'
													: 'text-gray-500'
											} ${className || ''}`}
										>
											<Icon
												className={`z-10 transition-all duration-200 text-[35px] ${
													isActive || forceActive ? '' : ''
												}`}
											/>
										</div>
										<span
											className={`text-[11px] whitespace-nowrap mt-[5px] ${
												isActive || forceActive
													? 'text-gray-700'
													: 'text-gray-500'
											}`}
										>
											{label}
										</span>
									</>
								)}
							</NavLink>
						)
					)}
				</div>
			</div>
		</div>
	)
}
