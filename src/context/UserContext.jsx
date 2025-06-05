import { createContext, useContext } from 'react'
import useSWR from 'swr'
import { fetcher } from '../utils/fetcher'

const UserContext = createContext()

export function UserProvider({ children }) {
	// Профиль пользователя
	const {
		data: profileData,
		error: profileError,
		mutate: mutateProfile,
	} = useSWR('/auth/profile', fetcher, {
		revalidateOnFocus: true,
		onError: error => {
			if (error.message === 'Unauthorized' || error.message === 'No token') {
				localStorage.removeItem('token')
				window.location.href = '/login'
			}
		},
	})

	// Адреса пользователя
	const {
		data: addressesData,
		error: addressesError,
		mutate: mutateAddresses,
	} = useSWR('/addresses/my', fetcher)

	// Обновление профиля
	const updateProfile = async userData => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/auth/profile`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify(userData),
				}
			)

			if (!response.ok) throw new Error('Ошибка обновления профиля')

			const data = await response.json()
			if (data.status === 'success') {
				await mutateProfile()
				return { success: true, data: data.data }
			} else {
				throw new Error(data.message || 'Ошибка обновления профиля')
			}
		} catch (error) {
			return { success: false, error: error.message }
		}
	}

	// Обновление пароля
	const updatePassword = async passwords => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/auth/profile/password`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify(passwords),
				}
			)

			if (!response.ok) throw new Error('Ошибка обновления пароля')

			const data = await response.json()
			return { success: true, data: data.data }
		} catch (error) {
			return { success: false, error: error.message }
		}
	}

	// Добавление адреса
	const addAddress = async (address, note = '') => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/addresses/add`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify({ address, note }),
				}
			)

			if (!response.ok) throw new Error('Ошибка добавления адреса')

			const data = await response.json()
			await mutateAddresses()
			return { success: true, data: data.data }
		} catch (error) {
			return { success: false, error: error.message }
		}
	}

	// Обновление адреса
	const updateAddress = async (id, address, note = '') => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/addresses/${id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify({ address, note }),
				}
			)

			if (!response.ok) throw new Error('Ошибка обновления адреса')

			const data = await response.json()
			await mutateAddresses()
			return { success: true, data: data.data }
		} catch (error) {
			return { success: false, error: error.message }
		}
	}

	// Удаление адреса
	const deleteAddress = async id => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/addresses/${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			)

			if (!response.ok) throw new Error('Ошибка удаления адреса')

			await mutateAddresses()
			return { success: true }
		} catch (error) {
			return { success: false, error: error.message }
		}
	}

	const value = {
		user: profileData?.data?.user,
		addresses: addressesData?.data?.addresses || [],
		isLoading: !profileData && !profileError,
		error: profileError || addressesError,
		updateProfile,
		updatePassword,
		addAddress,
		updateAddress,
		deleteAddress,
		mutateProfile,
		mutateAddresses,
	}

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
	const context = useContext(UserContext)
	if (!context) {
		throw new Error('useUser must be used within a UserProvider')
	}
	return context
}
