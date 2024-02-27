"use client";

import useSWR from "swr";
import Image from "next/image";

interface DailyChallenge {
	id: number;
	name: string;
	ppg?: number;
	team_id: number;
	team_abbreviation: string;
}

const fetcher = (url: string): Promise<DailyChallenge[]> =>
	fetch(url).then((res) => res.json());

export default function Home() {
	const { data, isLoading, isValidating, error } = useSWR(
		`${process.env.NEXT_PUBLIC_API_URL}/daily-challenge`,
		fetcher
	);

	return (
		<main className="p-12">
			<h1 className="text-center text-3xl font-bold text-black dark:text-white ">
				The Daily Dime
			</h1>
			{isLoading && <p>Loading...</p>}
			{!isLoading && data && (
				<div className="p-4 flex flex-col gap-5">
					<h2 className="text-center text-xl">
						Sort these players by their <span className="font-bold">Career PPG</span>
					</h2>
					{data.map((player) => (
						<div
							key={player.id}
							className="rounded-full bg-yellow-300 border-2 border-gray-600 flex gap-3 text-black dark:text-white"
						>
							<img
								src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`}
								className="h-24 rounded-l-full"
							/>
							<div className="p-2">
								<h2 className="text-xl font-bold">{player.name}</h2>
								<p className="flex gap-1">
									{player.team_abbreviation}
									<img
										src={`https://cdn.nba.com/logos/nba/${player.team_id}/primary/D/logo.svg`}
										className="h-6 w-6 rounded-full"
									/>
								</p>
								<p>{player.ppg} PPG</p>
							</div>
						</div>
					))}
				</div>
			)}
		</main>
	);
}
