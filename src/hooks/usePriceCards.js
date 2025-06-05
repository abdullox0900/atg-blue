import useSWR from 'swr'

const fetcher = async url => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error('Ошибка получения цен')
    }
    return response.json()
}

export function usePriceCards() {
    const { data, error, isLoading } = useSWR(
        `${import.meta.env.VITE_API_URL}/price-cards`,
        fetcher,
        {
            revalidateOnFocus: false, // Fokus o'zgarganda yangilamaslik
            refreshInterval: 30000, // Har 30 sekundda yangilash
        }
    )

    return {
        priceCards: data || [],
        isLoading,
        error,
    }
} 