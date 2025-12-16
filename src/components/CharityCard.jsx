// src/components/CharityCard.jsx

// Helper function to clean and format phone numbers for clickable links
const cleanPhoneNumber = (phone) => {
	if (!phone) return null;
	// Remove all non-digit and non-plus characters
	return phone.replace(/[^0-9+]/g, '');
};

// Helper function to concatenate the address fields
const formatAddress = (c) => {
	return [
		c.charity_contact_address1,
		c.charity_contact_address2,
		c.charity_contact_address3,
		c.charity_contact_postcode,
	]
		.filter((part) => part && typeof part === 'string' && part.trim())
		.join(', ');
};

export default function CharityCard({ charity }) {
	const cleanPhone = cleanPhoneNumber(charity.charity_contact_phone);
	const isGeocoded = charity.latitude !== null && charity.longitude !== null; // Check for geocoding success

	return (
		<div className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white">
			<h3 className="text-xl font-bold text-indigo-700">
				{charity.charity_name}
			</h3>

			<p className="text-sm text-gray-500 mb-3">
				Charity No. {charity.registered_charity_number}
			</p>

			{/* Warning if the charity cannot be used for geographic filtering */}
			{!isGeocoded && (
				<div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm text-yellow-800">
					**Location Data Missing:** This charity could not be accurately
					located, so it will not appear in postcode radius searches.
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Left Column: Contact and Location */}
				<div>
					<h4 className="font-semibold text-gray-700">Contact:</h4>
					<p className="text-sm">Address: {formatAddress(charity) || 'N/A'}</p>
					<p className="text-sm">
						Phone:{' '}
						{cleanPhone ? (
							<a
								href={`tel:${cleanPhone}`}
								className="text-blue-600 hover:underline"
							>
								{charity.charity_contact_phone}
							</a>
						) : (
							'N/A'
						)}
					</p>
					<p className="text-sm">
						Email:{' '}
						{charity.charity_contact_email ? (
							<a
								href={`mailto:${charity.charity_contact_email}`}
								className="text-blue-600 hover:underline"
							>
								{charity.charity_contact_email}
							</a>
						) : (
							'N/A'
						)}
					</p>
					<p className="text-sm">
						Website:{' '}
						{charity.charity_contact_web ? (
							<a
								href={charity.charity_contact_web}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								Visit Website
							</a>
						) : (
							'N/A'
						)}
					</p>
				</div>

				{/* Right Column: Activities */}
				<div>
					<h4 className="font-semibold text-gray-700">What they do:</h4>
					<p className="text-sm italic text-gray-700">
						{charity.charity_activities}
					</p>
				</div>
			</div>
		</div>
	);
}
