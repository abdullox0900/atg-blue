import { IoCloseOutline } from 'react-icons/io5'
import Logo from '../../assets/logo.png'

export default function PWAInstallModal({ onClose }) {
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

	return (
		<div
			className='fixed inset-0 bg-black/50 z-50'
			onClick={e => {
				if (e.target === e.currentTarget) onClose()
			}}
		>
			<div className='fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] p-6 transform transition-transform duration-300 ease-out'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-3'>
						<img src={Logo} alt='ATG Logo' className='h-8' />
						<h3 className='text-xl font-bold'>Установить приложение</h3>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-gray-100 rounded-full'
					>
						<IoCloseOutline size={24} />
					</button>
				</div>

				<div className='space-y-4'>
					{isIOS ? (
						<>
							<p className='font-medium'>Для установки на iPhone/iPad:</p>
							<ol className='list-decimal pl-5 space-y-2'>
								<li>
									Нажмите кнопку «Поделиться»{' '}
									<span className='px-2 py-1 bg-gray-100 rounded'>􀈂</span> внизу
									экрана
								</li>
								<li>В появившемся меню пролистайте вниз</li>
								<li>Выберите «На экран «Домой»»</li>
								<li>Нажмите «Добавить» в правом верхнем углу</li>
							</ol>
						</>
					) : (
						<>
							<p className='font-medium'>Для установки на Android:</p>
							<ol className='list-decimal pl-5 space-y-2'>
								<li>Нажмите на три точки в правом верхнем углу браузера</li>
								<li>Выберите «Установить приложение»</li>
								<li>Нажмите «Установить» в появившемся окне</li>
							</ol>
						</>
					)}

					<div className='mt-6'>
						<p className='text-sm text-gray-600'>
							После установки вы сможете запускать приложение прямо с главного
							экрана вашего устройства
						</p>
					</div>

					<div className='rounded-lg mb-6'>
						<h4 className='font-medium mb-2'>Преимущества установки:</h4>
						<ul className='space-y-2'>
							<li className='flex items-center gap-2'>
								Быстрый доступ с главного экрана
							</li>
							<li className='flex items-center gap-2'>Push уведомления</li>
							<li className='flex items-center gap-2'>
								Работает как обычное приложение
							</li>
							<li className='flex items-center gap-2'>
								Быстрая загрузка и экономия трафика
							</li>
							<li className='flex items-center gap-2'>
								Работает даже при медленном интернете
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
