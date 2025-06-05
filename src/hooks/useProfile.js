import useSWR from 'swr'
import { fetcher } from '../utils/fetcher'

// Профиль данных
export function useProfile() {
    const { data, error, mutate } = useSWR(
        '/auth/profile',
        fetcher
    )

    console.log(data)

    return {
        user: data?.data?.user,
        isLoading: !error && !data,
        error,
        mutate
    }
}

// Адреса пользователя
export function useAddresses() {
    const { data, error, mutate } = useSWR(
        '/addresses/my',
        fetcher
    )

    return {
        addresses: data?.data?.addresses || [],
        isLoading: !error && !data,
        error,
        mutate
    }
}

// Обновление профиля
export async function updateProfile(userData) {
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
            return { success: true, data: data.data }
        } else {
            throw new Error(data.message || 'Ошибка обновления профиля')
        }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Обновление пароля
export async function updatePassword(passwords) {
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
export async function addAddress(address, note = '') {
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
        return { success: true, data: data.data }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Обновление адреса
export async function updateAddress(id, address, note = '') {
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
        return { success: true, data: data.data }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Удаление адреса
export async function deleteAddress(id) {
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

        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Пользовательские данные с балансом
export function useUserInfo() {
    const { data, error, mutate } = useSWR(
        '/auth/profile',
        fetcher,
        {
            refreshInterval: 30000, // Обновлять каждые 30 секунд
            revalidateOnFocus: true // Обновлять при фокусе на странице
        }
    )

    return {
        userData: data?.data?.user,
        isLoading: !error && !data,
        error,
        mutate
    }
} 