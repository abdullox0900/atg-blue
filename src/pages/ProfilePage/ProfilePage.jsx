import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeleteIcon, EditIcon } from '../../assets/profile-icon/profile-icons'
import BonusHistoryModal from '../../components/BonusHistoryModal/BonusHistoryModal'
import PWAInstallModal from '../../components/PWAInstallModal/PWAInstallModal'
import { useAuth } from '../../context/AuthContext'
import { useBalance } from '../../hooks/useBalance'
import useUserStore from '../../store/userStore'

export default function ProfilePage() {
	const { isAuthenticated } = useAuth()
	const {
		user,
		updateProfile,
		updatePassword,
		addresses,
		fetchAddresses,
		addAddress,
		updateAddress,
		deleteAddress,
	} = useUserStore()
	const navigate = useNavigate()
	const [isEditing, setIsEditing] = useState('')
	const [editData, setEditData] = useState({
		name: '',
		phone: '',
		email: '',
	})
	const [editingAddress, setEditingAddress] = useState({ id: null, value: '' })
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [newAddress, setNewAddress] = useState('')
	const [showAddAddress, setShowAddAddress] = useState(false)
	const { balance, statistics } = useBalance()
	const { logout } = useAuth()
	const [showBonusHistory, setShowBonusHistory] = useState(false)
	const [showPWAInstall, setShowPWAInstall] = useState(false)
	const [isPWAInstalled, setIsPWAInstalled] = useState(false)

	useEffect(() => {
		if (user) {
			setEditData({
				name: user.name || '',
				phone: user.phone || '',
				email: user.email || '',
			})
			fetchAddresses()
		}
	}, [user])

	useEffect(() => {
		// PWA ўрнатилганлигини текшириш
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			window.navigator.standalone
		setIsPWAInstalled(isStandalone)
	}, [])

	const handleEdit = field => {
		setIsEditing(field)
		setEditData(prev => ({
			...prev,
			[field]: user[field] || '',
		}))
	}

	const handleSave = async field => {
		const result = await updateProfile({ [field]: editData[field] })
		if (result.success) {
			setIsEditing('')
			setSuccessMessage('Данные успешно обновлены')
			setTimeout(() => setSuccessMessage(''), 3000)
		} else {
			setError(result.error)
		}
	}

	const handleEditAddress = (id, address) => {
		setEditingAddress({ id, value: address })
	}

	const handleSaveAddress = async () => {
		if (!editingAddress.value.trim()) {
			setError('Введите адрес')
			return
		}

		const result = await updateAddress(editingAddress.id, editingAddress.value)
		if (result.success) {
			setEditingAddress({ id: null, value: '' })
			setSuccessMessage('Адрес успешно обновлен')
			setTimeout(() => setSuccessMessage(''), 3000)
		} else {
			setError(result.error)
		}
	}

	const handleAddAddress = async () => {
		if (!newAddress.trim()) {
			setError('Введите адрес')
			return
		}

		const result = await addAddress(newAddress)
		if (result.success) {
			setNewAddress('')
			setShowAddAddress(false)
			setSuccessMessage('Адрес успешно добавлен')
			setTimeout(() => setSuccessMessage(''), 3000)
		} else {
			setError(result.error)
		}
	}

	const handleDeleteAddress = async addressId => {
		const result = await deleteAddress(addressId)
		if (result.success) {
			setSuccessMessage('Адрес успешно удален')
			setTimeout(() => setSuccessMessage(''), 3000)
		} else {
			setError(result.error || 'Ошибка при удалении адреса')
			setTimeout(() => setError(''), 3000)
		}
	}

	const handleLogout = async () => {
		try {
			await logout()
			navigate('/login')
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	if (!isAuthenticated) {
		return (
			<div className='p-4'>
				<div className='text-center mb-[70px]'>
					<div className='bg-[#A41A18] text-white py-[14px] px-[30px] rounded-full mx-auto'>
						<p className='text-[18px] leading-[20px]'>
							Войдите или зарегистрируйтесь для заказа и начисления бонусов
						</p>
					</div>
				</div>
				<div className='flex flex-col gap-4 w-full mx-auto'>
					<button
						onClick={() => navigate('/login')}
						className='bg-[#0052A2] text-white py-[15px] px-4 rounded-[20px] text-sm'
					>
						Войти в личный кабинет
					</button>
					<button
						onClick={() => navigate('/register')}
						className='bg-[#0052A2] text-white py-[15px] px-4 rounded-[20px] text-sm'
					>
						Зарегистрироваться
					</button>
				</div>
			</div>
		)
	}

	if (!user) {
		return <div className='p-4 text-center'>Загрузка...</div>
	}

	return (
		<div className='p-4'>
			<div className='text-[20px] font-bold text-center mb-[20px]'>Профиль</div>

			{error && (
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
					{error}
				</div>
			)}
			{successMessage && (
				<div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4'>
					{successMessage}
				</div>
			)}

			<div className='space-y-6'>
				<div>
					<label className='block mb-2'>Имя</label>
					<div className='relative'>
						<input
							type='text'
							value={isEditing === 'name' ? editData.name : user?.name || ''}
							readOnly={isEditing !== 'name'}
							onChange={e => setEditData({ ...editData, name: e.target.value })}
							className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg pr-12'
						/>
						{isEditing === 'name' ? (
							<div className='absolute right-4 top-1/2 -translate-y-1/2 flex gap-2'>
								<button
									onClick={() => handleSave('name')}
									className='text-[#004B89] text-[24px]'
								>
									✓
								</button>
								<button
									onClick={() => setIsEditing('')}
									className='text-[#004B89] text-[24px]'
								>
									✕
								</button>
							</div>
						) : (
							<button
								onClick={() => handleEdit('name')}
								className='absolute right-4 top-1/2 -translate-y-1/2'
							>
								<EditIcon />
							</button>
						)}
					</div>
				</div>

				<div>
					<label className='block mb-2'>Телефон</label>
					<div className='relative'>
						<input
							type='tel'
							value={isEditing === 'phone' ? editData.phone : user?.phone || ''}
							readOnly={isEditing !== 'phone'}
							onChange={e =>
								setEditData({ ...editData, phone: e.target.value })
							}
							className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg pr-12'
						/>
						{isEditing === 'phone' ? (
							<div className='absolute right-4 top-1/2 -translate-y-1/2 flex gap-2'>
								<button
									onClick={() => handleSave('phone')}
									className='text-[#004B89] text-[24px]'
								>
									✓
								</button>
								<button
									onClick={() => setIsEditing('')}
									className='text-[#004B89] text-[24px]'
								>
									✕
								</button>
							</div>
						) : (
							<button
								onClick={() => handleEdit('phone')}
								className='absolute right-4 top-1/2 -translate-y-1/2'
							>
								<EditIcon />
							</button>
						)}
					</div>
				</div>

				<div>
					<label className='block mb-2'>E-mail</label>
					<div className='relative'>
						<input
							type='email'
							value={isEditing === 'email' ? editData.email : user?.email || ''}
							readOnly={isEditing !== 'email'}
							onChange={e =>
								setEditData({ ...editData, email: e.target.value })
							}
							className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg pr-12'
						/>
						{isEditing === 'email' ? (
							<div className='absolute right-4 top-1/2 -translate-y-1/2 flex gap-2'>
								<button
									onClick={() => handleSave('email')}
									className='text-[#004B89] text-[24px]'
								>
									✓
								</button>
								<button
									onClick={() => setIsEditing('')}
									className='text-[#004B89] text-[24px]'
								>
									✕
								</button>
							</div>
						) : (
							<button
								onClick={() => handleEdit('email')}
								className='absolute right-4 top-1/2 -translate-y-1/2'
							>
								<EditIcon />
							</button>
						)}
					</div>
				</div>

				<div>
					<h2 className='text-xl text-center font-bold mb-4'>Мои адреса</h2>
					<div className='space-y-4'>
						{addresses?.map((address, index) => (
							<div
								key={index}
								className='flex items-center justify-between p-4 rounded-lg'
							>
								{editingAddress.id === address.id ? (
									<input
										type='text'
										value={editingAddress.value}
										onChange={e =>
											setEditingAddress(prev => ({
												...prev,
												value: e.target.value,
											}))
										}
										className='flex-1 bg-white rounded outline-none'
									/>
								) : (
									<span className='text-[20px]'>{address.address}</span>
								)}
								<div className='flex gap-2'>
									{editingAddress.id === address.id ? (
										<>
											<button
												onClick={handleSaveAddress}
												className='text-[#004B89]'
											>
												✓
											</button>
											<button
												onClick={() =>
													setEditingAddress({ id: null, value: '' })
												}
												className='text-[#004B89]'
											>
												✕
											</button>
										</>
									) : (
										<>
											<button
												onClick={() =>
													handleEditAddress(address.id, address.address)
												}
												className='text-[#004B89]'
											>
												<EditIcon color={'#0052A2'} />
											</button>
											<button
												onClick={() => handleDeleteAddress(address.id)}
												className='text-[#0052A2]'
											>
												<DeleteIcon />
											</button>
										</>
									)}
								</div>
							</div>
						))}

						<button
							onClick={() => setShowAddAddress(true)}
							className='w-full bg-[#0052A2] text-white py-4 rounded-[20px] text-lg font-normal'
						>
							Добавить новый адрес
						</button>
					</div>
				</div>
			</div>

			{showAddAddress && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-lg p-6 w-full max-w-md'>
						<h3 className='text-xl font-bold mb-4'>Добавить новый адрес</h3>
						<input
							type='text'
							value={newAddress}
							onChange={e => setNewAddress(e.target.value)}
							placeholder='Введите новый адрес'
							className='w-full p-4 rounded-[20px] bg-[#E3EEFD] text-lg mb-4'
						/>
						<div className='flex gap-2'>
							<button
								onClick={handleAddAddress}
								className='flex-1 bg-[#0052A2] text-white py-4 rounded-[20px] text-lg'
							>
								Добавить
							</button>
							<button
								onClick={() => {
									setShowAddAddress(false)
									setNewAddress('')
								}}
								className='flex-1 bg-gray-300 text-gray-700 py-4 rounded-[20px] text-lg'
							>
								Отмена
							</button>
						</div>
					</div>
				</div>
			)}

			{showBonusHistory && (
				<BonusHistoryModal onClose={() => setShowBonusHistory(false)} />
			)}

			{!isPWAInstalled && (
				<button
					onClick={() => setShowPWAInstall(true)}
					className='w-full mt-4 bg-[#0052A2] text-white py-4 px-4 rounded-[20px] text-lg font-normal'
				>
					Установить приложение
				</button>
			)}

			<button
				onClick={handleLogout}
				className='w-full mt-4 bg-red-500 text-white py-4 px-4 rounded-[20px] text-lg font-normal hover:bg-red-600 transition-colors'
			>
				Выйти из аккаунта
			</button>

			{showPWAInstall && (
				<PWAInstallModal onClose={() => setShowPWAInstall(false)} />
			)}
		</div>
	)
}
