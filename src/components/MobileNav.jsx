// src/components/MobileNav.jsx
import { useState } from 'preact/hooks';
import { Menu, X } from 'lucide-preact';

const NAV_ITEMS = [
	{ name: 'Local Help', href: '/help' },
	{ name: 'Core Services', href: '/resources' },
	{ name: 'Glossary', href: '/glossary' },
	{ name: 'About', href: '/about' },
	{ name: 'Contact', href: '/contact' },
	// Removed dummy items for cleaner code, but the logic handles many links
];

// Conservative estimate for combined Banner + Header height on mobile.
const FIXED_TOP_HEIGHT_PX = 110;

export default function MobileNav({ currentPath }) {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);

	if (typeof document !== 'undefined') {
		// Prevent background scrolling when menu is open
		document.body.style.overflow = isOpen ? 'hidden' : '';
	}

	return (
		<div className="md:hidden flex items-center gap-3 z-50">
			{/* Hamburger Button */}
			<button
				onClick={toggleMenu}
				className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
				aria-label={isOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={isOpen}
			>
				{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</button>

			{/* Menu Drawer - FINAL FIX: Reliable height calculation and positioning */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-white p-0 shadow-xl z-40"
					// CRITICAL FIX: Set height using calc() to ensure it takes up the full remaining viewport.
					// The menu must start below the fixed header/banner content.
					style={{
						top: `${FIXED_TOP_HEIGHT_PX}px`,
						height: `calc(100vh - ${FIXED_TOP_HEIGHT_PX}px)`,
						overflowY: 'auto',
					}}
				>
					<div className="p-6">
						<div className="flex flex-col space-y-3">
							{NAV_ITEMS.map((item) => (
								<a
									key={item.name}
									href={item.href}
									className={`text-xl font-medium py-3 px-2 border-b transition ${
										currentPath === item.href || currentPath === `${item.href}/`
											? 'text-indigo-700 font-bold border-indigo-700'
											: 'text-slate-700 hover:text-indigo-600'
									}`}
									onClick={() => setIsOpen(false)}
								>
									{item.name}
								</a>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
