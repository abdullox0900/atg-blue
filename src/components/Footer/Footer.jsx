export default function Footer() {
	return (
		<footer className='bg-gray-50 py-4 px-4 mt-auto'>
			<div className='flex flex-col items-center text-center'>
				<p className='text-gray-700 text-[13px] max-[340px]:text-[11px] max-[300px]:text-[10px]'>
					ООО «АТГ» | ИНН 7842408851
				</p>
				<a
					href='https://atg.spb.ru/'
					target='_blank'
					rel='noopener noreferrer'
					className='text-[#004B89] hover:underline text-[13px] max-[340px]:text-[11px] max-[300px]:text-[10px]'
				>
					atg.spb.ru
				</a>
			</div>
		</footer>
	)
}
