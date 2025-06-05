// API запросы с авторизацией
export const fetcher = async (url) => {
    const token = localStorage.getItem('token')
    if (!token) {
        throw new Error('No token')
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            // Token yaroqsiz bo'lsa
            localStorage.removeItem('token') // Tokenni o'chirish
            window.location.href = '/login' // Login sahifasiga yo'naltirish
            throw new Error('Unauthorized')
        }
        throw new Error('An error occurred while fetching the data.')
    }

    return response.json()
} 