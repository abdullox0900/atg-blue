import { useEffect, useState } from 'react'
import { IoChevronBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

export default function DocumentsPage() {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState('offer')
	const [documents, setDocuments] = useState({
		offer: null,
		privacy: null,
		cookie: null,
	})
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	console.log(documents['offer'])

	useEffect(() => {
		const fetchDocuments = async () => {
			setIsLoading(true)
			try {
				const options = {
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'omit',
				}

				const [offerRes, privacyRes, cookieRes] = await Promise.all([
					fetch(
						`${import.meta.env.VITE_API_URL}/documents/offer`,
						options
					).then(r => r.json()),
					fetch(
						`${import.meta.env.VITE_API_URL}/documents/privacy`,
						options
					).then(r => r.json()),
					fetch(
						`${import.meta.env.VITE_API_URL}/documents/cookie`,
						options
					).then(r => r.json()),
				])

				setDocuments({
					offer: offerRes.data,
					privacy: privacyRes.data,
					cookie: cookieRes.data,
				})
			} catch (err) {
				setError('Ошибка при загрузке документов')
				console.error(err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchDocuments()
	}, [])

	const tabs = [
		{ id: 'offer', label: 'Оферта' },
		{ id: 'privacy', label: 'Конфиденциальность' },
		{ id: 'cookie', label: 'Cookie файлы' },
	]

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 p-4'>
				<div className='flex items-center gap-2 mb-6'>
					<button
						onClick={() => navigate(-1)}
						className='p-2 hover:bg-gray-100 rounded-full'
					>
						<IoChevronBack size={24} />
					</button>
					<h1 className='text-xl font-bold'>Документы</h1>
				</div>
				<div className='flex justify-center items-center h-[60vh]'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gray-50 p-4'>
				<div className='flex items-center gap-2 mb-6'>
					<button
						onClick={() => navigate(-1)}
						className='p-2 hover:bg-gray-100 rounded-full'
					>
						<IoChevronBack size={24} />
					</button>
					<h1 className='text-xl font-bold'>Документы</h1>
				</div>
				<div className='text-center text-red-500'>{error}</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen'>
			<div className='p-4'>
				<div className='flex items-center gap-2 mb-6'>
					<button
						onClick={() => navigate(-1)}
						className='p-2 hover:bg-gray-100 rounded-full'
					>
						<IoChevronBack size={24} />
					</button>
					<h1 className='text-xl font-bold'>Документы</h1>
				</div>

				<div className='bg-white rounded-lg shadow-sm mb-4 border border-gray-200'>
					<div className='flex border-b'>
						{tabs.map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex-1 py-3 text-sm font-medium ${
									activeTab === tab.id
										? 'text-[#004B89] border-b-2 border-[#004B89]'
										: 'text-gray-500'
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				<div className='bg-white rounded-lg shadow-sm p-4 border border-gray-200'>
					{documents[activeTab] && (
						<>
							<h2 className='text-lg font-bold mb-4'>
								{documents[activeTab].title}
							</h2>
							<div
								className='prose max-w-none'
								dangerouslySetInnerHTML={{
									__html: documents[activeTab].content,
								}}
							/>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
