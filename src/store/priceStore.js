import { create } from 'zustand'

const usePriceStore = create((set) => ({
    priceCards: [],
    isLoading: false,
    error: null,

    fetchPriceCards: async () => {
        try {
            set({ isLoading: true, error: null })
            const response = await fetch(`${import.meta.env.VITE_API_URL}/price-cards`)

            if (!response.ok) {
                throw new Error('Ошибка получения цен')
            }

            const data = await response.json()
            console.log('Price cards response:', data)

            if (data === 'success') {
                set({ priceCards: data })
            } else {
                throw new Error(data.message || 'Ошибка получения данных')
            }
        } catch (error) {
            console.error('Fetch price cards error:', error)
            set({ error: 'Ошибка при получении данных цен' })
        } finally {
            set({ isLoading: false })
        }
    }
}))

export default usePriceStore 