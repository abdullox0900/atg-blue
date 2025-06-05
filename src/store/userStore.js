import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            addresses: [],

            setUser: user => set({ user }),
            setToken: token => {
                if (!token) {
                    console.error('Attempting to set null/undefined token')
                    return
                }
                set({ token })
            },
            clearUser: () => {
                localStorage.removeItem('token')
                set({ user: null, token: null })
            },

            fetchProfile: async () => {
                const token = get().token || localStorage.getItem('token')
                if (!token) {
                    set({ error: 'Не авторизован' })
                    return
                }

                try {
                    set({ isLoading: true, error: null })
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/auth/profile`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    )

                    if (!response.ok) {
                        if (response.status === 401) {
                            get().clearUser()
                            set({ error: 'Сессия истекла. Пожалуйста, войдите снова.' })
                            return
                        }
                        throw new Error('Ошибка сервера')
                    }

                    const data = await response.json()
                    if (data.status === 'success') {
                        set({ user: data.data.user })
                    } else {
                        set({ error: data.message || 'Ошибка получения данных' })
                    }
                } catch (error) {
                    console.error('Profile fetch error:', error)
                    set({ error: 'Ошибка при получении данных профиля' })
                } finally {
                    set({ isLoading: false })
                }
            },

            updateProfile: async userData => {
                const token = get().token || localStorage.getItem('token')
                if (!token) {
                    return { success: false, error: 'Не авторизован' }
                }

                try {
                    set({ isLoading: true, error: null })
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/auth/profile`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(userData),
                        }
                    )

                    if (!response.ok) {
                        if (response.status === 401) {
                            get().clearUser()
                            return {
                                success: false,
                                error: 'Сессия истекла. Пожалуйста, войдите снова.',
                            }
                        }
                        throw new Error('Ошибка сервера')
                    }

                    const data = await response.json()
                    if (data.status === 'success') {
                        set({ user: data.data.user })
                        return { success: true }
                    } else {
                        set({ error: data.message })
                        return { success: false, error: data.message }
                    }
                } catch (error) {
                    console.error('Profile update error:', error)
                    set({ error: 'Ошибка при обновлении профиля' })
                    return { success: false, error: 'Ошибка при обновлении профиля' }
                } finally {
                    set({ isLoading: false })
                }
            },

            updatePassword: async passwords => {
                const token = get().token || localStorage.getItem('token')
                if (!token) {
                    return { success: false, error: 'Не авторизован' }
                }

                try {
                    set({ isLoading: true, error: null })
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/auth/profile/password`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(passwords),
                        }
                    )

                    if (!response.ok) {
                        if (response.status === 401) {
                            get().clearUser()
                            return {
                                success: false,
                                error: 'Сессия истекла. Пожалуйста, войдите снова.',
                            }
                        }
                        throw new Error('Ошибка сервера')
                    }

                    const data = await response.json()
                    if (data.status === 'success') {
                        return { success: true }
                    } else {
                        set({ error: data.message })
                        return { success: false, error: data.message }
                    }
                } catch (error) {
                    console.error('Password update error:', error)
                    set({ error: 'Ошибка при обновлении пароля' })
                    return { success: false, error: 'Ошибка при обновлении пароля' }
                } finally {
                    set({ isLoading: false })
                }
            },

            fetchAddresses: async () => {
                const token = get().token || localStorage.getItem('token')
                if (!token) return

                try {
                    set({ isLoading: true, error: null })
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/addresses/my`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    )

                    if (!response.ok) {
                        throw new Error('Ошибка получения адресов')
                    }

                    const data = await response.json()
                    if (data.status === 'success') {
                        set({ addresses: data.data.addresses })
                    }
                } catch (error) {
                    console.error('Fetch addresses error:', error)
                    set({ error: 'Ошибка при получении адресов' })
                } finally {
                    set({ isLoading: false })
                }
            },

            addAddress: async (address, note = '') => {
                const token = get().token
                if (!token) return { success: false, error: 'Не авторизован' }

                try {
                    set({ isLoading: true, error: null })
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/addresses/add`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ address, note }),
                        }
                    )

                    const data = await response.json()
                    if (data.status === 'success') {
                        get().fetchAddresses() // Refresh addresses list
                        return { success: true }
                    }
                    return { success: false, error: data.message }
                } catch (error) {
                    return { success: false, error: 'Ошибка при добавлении адреса' }
                } finally {
                    set({ isLoading: false })
                }
            },

            updateAddress: async (id, address, note = '') => {
                const token = get().token
                if (!token) return { success: false, error: 'Не авторизован' }

                try {
                    set({ isLoading: true, error: null })
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/addresses/${id}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ address, note }),
                        }
                    )

                    const data = await response.json()
                    if (data.status === 'success') {
                        get().fetchAddresses() // Refresh addresses list
                        return { success: true }
                    }
                    return { success: false, error: data.message }
                } catch (error) {
                    return { success: false, error: 'Ошибка при обновлении адреса' }
                } finally {
                    set({ isLoading: false })
                }
            },

            deleteAddress: async (addressId) => {
                try {
                    const token = localStorage.getItem('token')
                    if (!token) throw new Error('No token found')

                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/addresses/${addressId}`,
                        {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (!response.ok) throw new Error('Failed to delete address')

                    // O'chirilgan addressni state dan olib tashlash
                    set(state => ({
                        addresses: state.addresses.filter(addr => addr.id !== addressId)
                    }))

                    return { success: true }
                } catch (error) {
                    console.error('Error deleting address:', error)
                    return { success: false, error: error.message }
                }
            }
        }),
        {
            name: 'user-storage',
            partialize: state => ({
                token: state.token,
                user: state.user,
            }),
        }
    )
)

export default useUserStore 