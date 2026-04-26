import { useEffect, useState } from "react";
import ValuePropositionSection from "@/components/ValuePropositionSection";
import "../design-tokens.css";

function LandingPage() {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", isDark);
	}, [isDark]);

	return (
		<div className='min-h-screen bg-slate-100 px-6 py-8 transition-colors duration-300 dark:bg-[#030a1c]'>
			<div className='mx-auto max-w-6xl'>
				<div className='mb-6 flex justify-end'>
					<button
						type='button'
						onClick={() => setIsDark((prev) => !prev)}
						className='ui-secondary-control'>
						Switch to {isDark ? "Light" : "Dark"} Mode
					</button>
				</div>
			</div>
			<ValuePropositionSection />
		</div>
	);
}
export default LandingPage;
