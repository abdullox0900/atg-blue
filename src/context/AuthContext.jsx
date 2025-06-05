import { createContext, useContext, useEffect } from 'react'
import { setOneSignalExternalId } from '../services/oneSignal'
import useUserStore from '../store/userStore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const { user, token, setUser, setToken, clearUser, fetchProfile } =
		useUserStore()

	useEffect(() => {
		// Check for token in localStorage on mount
		const storedToken = localStorage.getItem('token')
		if (storedToken) {
			setToken(storedToken)
		}
	}, [])

	useEffect(() => {
		if (token) {
			fetchProfile()
		}
	}, [token])

	const login = async (newToken, userData) => {
		console.log('Login called with:', { newToken, userData }) // Debug log
		if (!newToken) {
			console.error('No token provided to login function')
			return
		}
		// Store token in localStorage
		localStorage.setItem('token', newToken)
		// Update store
		setToken(newToken)
		setUser(userData)

		// OneSignal ID ни ўрнатиш
		await setOneSignalExternalId(userData.id)
	}

	const logout = () => {
		localStorage.removeItem('token')
		clearUser()
		// OneSignal ID ни ўчирмаймиз
	}

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!token,
				userData: user,
				token,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
