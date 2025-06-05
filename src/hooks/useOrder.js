import useSWR from 'swr'

const fetcher = async url => {
    const token = localStorage.getItem('token')
    if (!token) return []

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            return []
        }
        throw new Error('Ошибка получения заказов')
    }
    return response.json()
}

const createOrder = async (url, { arg }) => {
    const token = localStorage.getItem('token')
    if (!token) {
        throw new Error('Не авторизован')
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(arg),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Ошибка создания заказа')
        }

        return response.json()
    } catch (error) {
        console.error('Order creation error:', error)
        throw error
    }
}

const updateBalance = async (amount) => {
    const token = localStorage.getItem('token')
    if (!token) return null

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/balance/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount })
        })

        if (!response.ok) {
            throw new Error('Failed to update balance')
        }

        return response.json()
    } catch (error) {
        console.error('Balance update error:', error)
        throw error
    }
}

export function useOrder() {
    const { data: data, error, isLoading, mutate } = useSWR(
        `${import.meta.env.VITE_API_URL}/orders/my`,
        fetcher,
        {
            revalidateOnFocus: false,
            onSuccess: async (data) => {
                // Check completed orders and update balance
                if (Array.isArray(data)) {
                    for (const order of data) {
                        if (order.status === 'completed' && !order.balanceUpdated) {
                            try {
                                // If discount was used, subtract from balance
                                if (order.useDiscount) {
                                    await updateBalance(-order.discountAmount)
                                }

                                // Add earned discount to balance
                                const earnedDiscount = Math.floor(order.totalAmount * 0.01)
                                await updateBalance(earnedDiscount)

                                // Mark order as balance updated
                                await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/mark-updated`, {
                                    method: 'PUT',
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                })

                                // Refresh orders data
                                mutate()
                            } catch (error) {
                                console.error('Error updating balance:', error)
                            }
                        }
                    }
                }
            }
        }
    )

    const submitOrder = async orderData => {
        try {
            const result = await createOrder(
                `${import.meta.env.VITE_API_URL}/orders`,
                {
                    arg: orderData,
                }
            )
            await mutate()
            return { success: true, data: result }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Ошибка при создании заказа',
            }
        }
    }

    return {
        orders: data || [],
        isLoading,
        error,
        submitOrder,
    }
} 