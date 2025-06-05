import useSWR from 'swr'

const fetcher = async url => {
    const token = localStorage.getItem('token')
    if (!token) return null

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            return null
        }
        throw new Error('Ошибка получения данных заказа')
    }
    return response.json()
}

export function useOrderDetails(orderId) {
    const { data, error, isLoading } = useSWR(
        orderId ? `${import.meta.env.VITE_API_URL}/orders/${orderId}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    )

    return {
        orderDetails: data || null,
        isLoading,
        error,
    }
} 