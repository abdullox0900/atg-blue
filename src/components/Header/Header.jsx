import Logo from '../../assets/logo.png'
import MenuIcon from '../../assets/menu-icon.svg'

export default function Header() {
	return (
		<div className='flex justify-between items-center p-4'>
			<div className='text-[13px] text-center max-[340px]:text-[11px] max-[300px]:text-[10px]'>
				<img src={MenuIcon} alt='Menu Icon' />
			</div>
			<img
				src={Logo}
				alt='ATG Logo'
				className='h-12 max-[390px]:h-11 max-[340px]:h-10 max-[300px]:h-9 pr-6'
			/>
			<div></div>
		</div>
	)
}
