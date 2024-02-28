"use client";

import React from "react";
import useSWR from "swr";
import Image from "next/image";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { FaCheck } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";

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

	const [players, setPlayers] = React.useState<DailyChallenge[] | undefined>(
		[]
	);

	React.useEffect(() => {
		// cache page in state
		setPlayers(data);
	}, [data]);

	const onDragEnd = (result: any) => {
		if (!result.destination) return;

		if (players) {
			const items = players;
			const [reorderedItem] = items.splice(result.source.index, 1);
			items.splice(result.destination.index, 0, reorderedItem);

			setPlayers(items);
		}
	};

	return (
		<main className="p-12">
			<h1 className="text-center text-3xl font-bold text-black dark:text-white ">
				The Daily Dime
			</h1>
			{isLoading && <p>Loading...</p>}
			<DragDropContext onDragEnd={onDragEnd}>
				{!isLoading && data && (
					<div>
						<div className="p-4">
							<h2 className="text-center text-xl pb-5">
								Sort these players by their{" "}
								<span className="font-bold">Career PPG</span>
							</h2>
							<Droppable droppableId="players">
								{(provided: any) => (
									<div
										className="flex flex-col"
										{...provided.droppableProps}
										ref={provided.innerRef}
									>
										{data.map((player, i) => (
											<Draggable key={i} draggableId={String(i)} index={i}>
												{(provided: any) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														className="mb-5 rounded-full bg-gray-300 border-2 border-gray-600 flex justify-between text-black dark:text-white"
													>
														<div className="flex gap-3">
															<img
																src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`}
																className="h-24 rounded-l-full"
															/>
															<div className="p-2">
																<h2 className="text-xl font-bold">
																	{player.name}
																</h2>
																<p className="flex gap-1">
																	{player.team_abbreviation
																		? player.team_abbreviation
																		: "Waived"}
																	{!!player.team_id && (
																		<img
																			src={`https://cdn.nba.com/logos/nba/${player.team_id}/primary/D/logo.svg`}
																			className="h-6 w-6 rounded-full"
																			alt={`${player.team_abbreviation} logo`}
																		/>
																	)}
																</p>
																<p className="">{player.ppg} PPG</p>
															</div>
														</div>
														<div className="flex items-center gap-3 pr-5">
															<button className="bg-cyan-600 border-4 border-black rounded-full p-2">
																<FaArrowUp className="w-8 h-8" />
															</button>
															<button className="bg-rose-600 border-4 border-black rounded-full p-2">
																<FaArrowDown className="w-8 h-8" />
															</button>
														</div>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</div>
						<div className="flex justify-center">
							<button className="bg-teal-600 rounded-md p-3 text-white transition-all hover:scale-105 flex gap-2 items-center">
								Check <FaCheck className="inline" />
							</button>
						</div>
					</div>
				)}
			</DragDropContext>
		</main>
	);
}
