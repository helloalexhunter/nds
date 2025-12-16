// src/components/CharityList.jsx
import { useState, useMemo, useEffect } from 'preact/hooks';
import CharityCard from './CharityCard.jsx';
import useDebounce from '../hooks/useDebounce.js';

// --- Haversine Distance Calculation (IN MILES - WITH SWAP FIX) ---
const distanceInMiles = (coord1, coord2) => {
	// Helper function to safely parse and swap coordinates if needed
	const safeParseAndSwap = (coord) => {
		let lat = parseFloat(coord.lat);
		let lon = parseFloat(coord.lon);

		if (isNaN(lat) || isNaN(lon)) {
			return { lat: NaN, lon: NaN };
		}

		// HEURISTIC SWAP CHECK: If Latitude is small (near 0) and Longitude is large (near 50)
		if (lat < 10 && lon > 40) {
			return { lat: lon, lon: lat };
		}
		return { lat: lat, lon: lon };
	};

	const user = safeParseAndSwap(coord1);
	const charity = safeParseAndSwap(coord2);

	if (isNaN(user.lat) || isNaN(charity.lat)) {
		return Infinity;
	}

	const toRad = (x) => (x * Math.PI) / 180;
	const R = 3959; // Radius of Earth in MILES
	const dLat = toRad(charity.lat - user.lat);
	const dLon = toRad(charity.lon - user.lon);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(user.lat)) *
			Math.cos(toRad(charity.lat)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

// --- Postcodes.io Geocoding Function (same as before) ---
async function getPostcodeCoords(postcode) {
	const cleanedPostcode = postcode.replace(/\s/g, '').toLowerCase();
	const apiUrl = `https://api.postcodes.io/postcodes/${cleanedPostcode}`;

	try {
		const response = await fetch(apiUrl);
		const data = await response.json();

		if (data.status === 200 && data.result) {
			return {
				lat: data.result.latitude,
				lon: data.result.longitude,
				valid: true,
			};
		} else {
			return { valid: false, error: 'Postcode not found' };
		}
	} catch (error) {
		return { valid: false, error: 'API fetch error' };
	}
}
// ----------------------------------------

// Map friendly names to the exact category strings from the JSON
const CATEGORY_MAP = {
	'Debt Help': 'Debt Advice & Financial',
	'Food Banks': 'Food Banks & Relief',
	'Shelter / Housing': 'Shelter & Housing',
	'Mental Health': 'Mental Health Support', // Assumed category from the new plan
};

const CATEGORY_BUTTONS = [
	{ name: 'Debt Help', icon: '💰', category: 'Debt Advice & Financial' },
	{ name: 'Food Banks', icon: '🍎', category: 'Food Banks & Relief' },
	{ name: 'Shelter / Housing', icon: '🏠', category: 'Shelter & Housing' },
	{ name: 'Mental Health', icon: '🧠', category: 'Mental Health Support' },
];

// We set a fixed, sensible local radius for button filtering
const DEFAULT_RADIUS_MILES = 10;

export default function CharityList({ initialData }) {
	// Only category filtering now
	const [selectedCategory, setSelectedCategory] = useState(
		CATEGORY_MAP['Debt Help']
	); // Default to Debt Help

	// Postcode state management is unchanged
	const [postcode, setPostcode] = useState('');
	const [userLocation, setUserLocation] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	// We keep the old keyword search state for the optional "Advanced Search" area
	const [rawSearchTerm, setRawSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(rawSearchTerm, 300);

	// Effect to fetch user coordinates (unchanged)
	useEffect(() => {
		if (postcode.length >= 5 && postcode.length <= 8) {
			setIsLoading(true);
			getPostcodeCoords(postcode).then((location) => {
				setUserLocation(location);
				setIsLoading(false);
			});
		} else {
			setUserLocation(null);
		}
	}, [postcode]);

	// Memoize the list processing
	const filteredCharities = useMemo(() => {
		let results = initialData;
		const userCoords = userLocation && userLocation.valid ? userLocation : null;

		// 1. Category Filter (Primary Filter)
		results = results.filter(
			(charity) => charity.category === selectedCategory
		);

		// 2. Geographic Filter (Runs only if user postcode is valid)
		if (userCoords) {
			results = results.filter((charity) => {
				const charityCoords = { lat: charity.latitude, lon: charity.longitude };
				if (charityCoords.lat === null || charityCoords.lon === null) {
					return false;
				}

				// Use the fixed local radius
				const distance = distanceInMiles(userCoords, charityCoords);
				return distance <= DEFAULT_RADIUS_MILES;
			});
		}

		// 3. Optional Keyword Filter (If used in the Advanced section)
		if (debouncedSearchTerm) {
			const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
			results = results.filter(
				(charity) =>
					charity.charity_name.toLowerCase().includes(lowerSearchTerm) ||
					(charity.charity_activities &&
						charity.charity_activities.toLowerCase().includes(lowerSearchTerm))
			);
		}

		// 4. Sort (Nearest first if geographic search was active)
		if (userCoords) {
			return results.sort((a, b) => {
				const distanceA = distanceInMiles(userCoords, {
					lat: a.latitude,
					lon: a.longitude,
				});
				const distanceB = distanceInMiles(userCoords, {
					lat: b.latitude,
					lon: b.longitude,
				});
				return distanceA - distanceB;
			});
		}

		return results;
	}, [initialData, selectedCategory, userLocation, debouncedSearchTerm]);

	// --- Pagination and Status ---
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 20;
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentItems = filteredCharities.slice(
		startIndex,
		startIndex + itemsPerPage
	);
	const totalPages = Math.ceil(filteredCharities.length / itemsPerPage);

	const isPostcodeValid = userLocation && userLocation.valid;
	const isPostcodeInvalid =
		userLocation && !userLocation.valid && !isLoading && postcode.length > 5;

	const selectedButton = CATEGORY_BUTTONS.find(
		(b) => b.category === selectedCategory
	);
	const currentTitle = selectedButton
		? `${selectedButton.icon} ${selectedButton.name}`
		: 'Charity Search';

	const handleCategoryClick = (categoryName) => {
		setSelectedCategory(categoryName);
		setCurrentPage(1);
		// Clear keyword search when switching categories
		setRawSearchTerm('');
	};

	return (
		<div className="space-y-6">
			{/* 1. LOCATION INPUT & STATUS */}
			<div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
				<h2 className="text-2xl font-bold mb-4 text-indigo-700">
					Step 1: Where are you looking for help?
				</h2>

				<div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
					<input
						type="text"
						id="postcode"
						value={postcode}
						onInput={(e) => {
							setPostcode(e.target.value.toUpperCase());
							setCurrentPage(1);
						}}
						className={`w-full md:w-64 border rounded-lg p-3 text-lg ${isPostcodeInvalid ? 'border-red-500' : 'border-gray-300'}`}
						placeholder="Enter your UK Postcode"
					/>

					{/* Status Feedback */}
					<div className="text-sm">
						{isLoading && (
							<span className="text-indigo-600 font-semibold">
								Checking postcode...
							</span>
						)}
						{isPostcodeValid && (
							<span className="text-green-600 font-semibold">
								✅ Location set to {postcode}.
							</span>
						)}
						{isPostcodeInvalid && (
							<span className="text-red-600 font-semibold">
								❌ Invalid UK Postcode.
							</span>
						)}
						{!postcode && !isLoading && (
							<span className="text-gray-500">
								Please enter a postcode for local results.
							</span>
						)}
					</div>
				</div>

				{!isPostcodeValid && postcode.length > 0 && isPostcodeInvalid && (
					<p className="mt-2 text-sm text-red-600">
						Please re-enter your postcode to enable the local search filter.
					</p>
				)}
			</div>

			{/* 2. CATEGORY BUTTONS */}
			<div className="bg-gray-50 p-6 rounded-xl shadow-lg">
				<h2 className="text-2xl font-bold mb-4 text-gray-800">
					Step 2: What kind of help do you need?
				</h2>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{CATEGORY_BUTTONS.map((button) => (
						<button
							key={button.category}
							onClick={() => handleCategoryClick(button.category)}
							className={`p-4 rounded-lg text-center font-bold transition duration-200 shadow-md ${
								selectedCategory === button.category
									? 'bg-indigo-600 text-white ring-4 ring-indigo-300'
									: 'bg-white text-gray-700 hover:bg-indigo-50 hover:shadow-xl'
							}`}
						>
							<span className="text-3xl block mb-1">{button.icon}</span>
							{button.name}
						</button>
					))}
				</div>
			</div>

			{/* 3. RESULTS DISPLAY */}
			<div className="pt-4 border-t border-gray-300">
				<div className="text-xl font-semibold mb-4">
					Showing results for:{' '}
					<span className="text-indigo-700">{currentTitle}</span>
					<span className="ml-3 text-base font-normal text-gray-600">
						({filteredCharities.length} results)
					</span>
				</div>

				<div className="text-lg font-medium text-gray-700 mb-4 p-3 bg-blue-50 border-l-4 border-blue-400">
					Results are filtered by the selected category and restricted to a{' '}
					<strong>{DEFAULT_RADIUS_MILES} mile radius</strong> of{' '}
					{isPostcodeValid ? postcode : 'your entered postcode'}.
				</div>

				{/* NO RESULTS MESSAGE (unchanged) */}
				{filteredCharities.length === 0 && (
					<div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
						<p className="text-lg font-semibold text-gray-700">
							No charities found matching your criteria.
						</p>
						<p className="text-gray-500">
							Try broadening your search criteria.
						</p>
					</div>
				)}

				{/* Charity List */}
				<div className="space-y-4">
					{currentItems.map((charity) => (
						<CharityCard
							key={charity.registered_charity_number}
							charity={charity}
						/>
					))}
				</div>
			</div>

			{/* 4. ADVANCED SEARCH & PAGINATION (Optional, hidden by default, or you can remove this section) */}
			<details className="mt-8 p-4 border rounded-lg bg-gray-50">
				<summary className="font-semibold text-gray-700 cursor-pointer">
					⚙️ Advanced Search (Keyword Filter)
				</summary>
				<div className="mt-4">
					<label
						htmlFor="search"
						className="block text-sm font-medium text-gray-700"
					>
						Further filter by Keyword (e.g., loan, grant)
					</label>
					<input
						type="text"
						id="search"
						value={rawSearchTerm}
						onInput={(e) => {
							setRawSearchTerm(e.target.value);
							setCurrentPage(1);
						}}
						className="mt-1 block w-full border border-gray-300 rounded-md p-2"
						placeholder="Search name or activity within the selected category"
					/>
					{rawSearchTerm && rawSearchTerm !== debouncedSearchTerm && (
						<p className="text-sm text-indigo-600 mt-1">
							Typing... filtering soon.
						</p>
					)}
				</div>
			</details>

			{/* Pagination Controls (unchanged) */}
			{/* ... (pagination code remains the same) ... */}
			{totalPages > 1 && (
				<div className="flex justify-center items-center space-x-2 mt-4">
					<button
						onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
						disabled={currentPage === 1}
						className="px-4 py-2 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-100 transition"
					>
						Previous
					</button>
					<span className="text-gray-700">
						Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() =>
							setCurrentPage((prev) => Math.min(totalPages, prev + 1))
						}
						disabled={currentPage === totalPages}
						className="px-4 py-2 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-100 transition"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
