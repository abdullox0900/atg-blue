import useSWR from 'swr'

const fetcher = async url => {
    const token = localStorage.getItem('token')
    if (!token) return null

    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        throw new Error('Failed to fetch balance')
    }

    return response.json()
}

export function useBalance() {
    const { data, error, mutate } = useSWR('profile', fetcher, {
        refreshInterval: 5000,
        revalidateOnFocus: true,
    })

    return {
        balance: data?.data?.user?.discountBalance || 0,
        hasFirstOrderDiscount: data?.data?.user?.firstOrderDiscount || false,
        statistics: {
            totalUsed: data?.data?.user?.usedBonuses || 0,
            totalSaved: data?.data?.user?.savedBonuses || 0
        },
        isLoading: !error && !data,
        error,
        mutateBalance: mutate
    }
} 