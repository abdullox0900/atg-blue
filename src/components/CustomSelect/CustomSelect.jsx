import { useEffect, useRef, useState } from 'react'

export default function CustomSelect({
	value,
	onChange,
	options,
	placeholder,
}) {
	const [isOpen, setIsOpen] = useState(false)
	const selectRef = useRef(null)

	const selectedOption = options?.find(opt => opt.id === value)

	useEffect(() => {
		const handleClickOutside = event => {
			if (selectRef.current && !selectRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className='relative' ref={selectRef}>
			<div
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full p-[18px] rounded-[20px] bg-[#E3EEFD] cursor-pointer flex justify-between items-center ${
					isOpen ? 'rounded-b-none rounded-t-[20px]' : ''
				}`}
			>
				<span className={`${!selectedOption ? 'text-gray-500' : ''}`}>
					{selectedOption ? selectedOption.address : placeholder}
				</span>
				<svg
					width={14}
					height={9}
					viewBox='0 0 14 9'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M12 2L7 7L2 2'
						stroke='black'
						strokeWidth={4}
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			</div>

			{isOpen && (
				<div className='absolute z-10 w-full bg-[#E3EEFD] border-t border-gray-200 rounded-b-[20px] max-h-60 overflow-auto'>
					{options?.map(option => (
						<div
							key={option.id}
							onClick={() => {
								onChange(option.id)
								setIsOpen(false)
							}}
							className={`p-4 cursor-pointer hover:bg-[#e3eefdb7] transition-colors ${
								value === option.id ? 'bg-[#E3EEFD]' : ''
							}`}
						>
							{option.address}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
