export const formatPrice = (price) => {
    if (!price) return '0'

    // Convert to string and remove any existing spaces
    const numStr = String(price).replace(/\s/g, '')

    // Split into integer and decimal parts if exists
    const [integerPart, decimalPart] = numStr.split('.')

    // Add spaces for thousands
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    // Return with decimal part if it exists
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
} 