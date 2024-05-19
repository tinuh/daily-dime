"use client";

import React from "react";
import useSWR from "swr";
import Image from "next/image";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { FaCheck } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import { RiShare2Line } from "react-icons/ri";

import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

interface DailyChallenge {
	id: number;
	name: string;
	ppg?: number;
	team_id: number;
	team_abbreviation: string;
	color?: string;
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
	const [revealAnswer, setRevealAnswer] = React.useState<boolean>(false);
	const [blur, setBlur] = React.useState<boolean>(true);

	const [isActive, setIsActive] = React.useState(false);
	const [isPaused, setIsPaused] = React.useState(true);
	const [time, setTime] = React.useState(0);

	const [penality, setPenality] = React.useState<boolean>(false);

	React.useEffect(() => {
		let interval: any = null;

		if (isActive && isPaused === false) {
			interval = setInterval(() => {
				setTime((time) => time + 100);
			}, 100);
		} else {
			clearInterval(interval);
		}
		return () => {
			clearInterval(interval);
		};
	}, [isActive, isPaused]);

	React.useEffect(() => {
		// set the gamme
		let temp = data;
		temp?.forEach((player) => {
			player.color = "gray";
		});
		setPlayers(temp);
	}, [data]);

	const onDragEnd = (result: any) => {
		if (!result.destination) return;

		if (players) {
			const items = JSON.parse(JSON.stringify(players));
			const [reorderedItem] = items.splice(result.source.index, 1);
			items.splice(result.destination.index, 0, reorderedItem);

			setPlayers(items);
		}
	};

	// verify the order and set green if in the right position based on ppg and yellow if in nearby position
	const verifyOrder = () => {
		// create a temp array sorted by ppg
		if (players) {
			let temp: DailyChallenge[] = JSON.parse(JSON.stringify(players));
			temp.sort((a, b) => (b.ppg ? b.ppg : 0) - (a.ppg ? a.ppg : 0));

			console.log("temp", temp);

			// compare the two arrays
			let count = 0;
			let newPlayers: DailyChallenge[] = JSON.parse(JSON.stringify(players));
			newPlayers?.forEach((player, i) => {
				if (player.name === temp[i].name) {
					player.color = "green";
					count++;
				} else if (
					player.name === temp[i - 1]?.name ||
					player.name === temp[i + 1]?.name
				) {
					player.color = "yellow";
				} else {
					player.color = "gray";
				}
			});

			if (count === players.length) {
				setRevealAnswer(true);
				setIsPaused(true);
			} else {
				setTime((prev) => prev + 5000);
				penalize();
			}

			setPlayers(newPlayers);
		}
	};

	const movePlayer = (index: number, direction: "up" | "down") => {
		if (players) {
			const items = JSON.parse(JSON.stringify(players));
			const [reorderedItem] = items.splice(index, 1);
			if (direction === "up") {
				items.splice(index - 1, 0, reorderedItem);
			} else {
				items.splice(index + 1, 0, reorderedItem);
			}

			setPlayers(items);
		}
	};

	const startGame = () => {
		setBlur(false);
		setIsActive(true);
		setIsPaused(false);
	};

	const penalize = () => {
		setPenality(true);
		setTimeout(() => setPenality(false), 2000);
	};

	const copy = async () => {
		// include the date of the challenge in the format mm/dd/yyyy
		let date = new Date();
		let month = date.getMonth() + 1;
		let day = date.getDate();
		let year = date.getFullYear();
		let dateString = `${month}/${day}/${year}`;

		await navigator.clipboard.writeText(
			`I just completed the ${dateString} Daily Dime challenge in ${
				time / 1000
			} seconds! Can you beat my time?`
		);
	};

	const share = () => {
		const myPromise = copy();

		toast.promise(myPromise, {
			loading: "Generating results...",
			success: "Copied to clipboard!",
			error: "Error copying to clipboard",
		});
	};

	return (
		<main className="p-12">
			<h1 className="text-center text-3xl font-bold text-black dark:text-white ">
				The Daily Dime
			</h1>
			<Toaster position="top-right" reverseOrder={false} />
			{isLoading && (
				<p className="text-center pt-6 font-bold text-lg">Loading...</p>
			)}

			<DragDropContext onDragEnd={onDragEnd}>
				{!isLoading && data && (
					<div className="relative">
						{blur && (
							<div className="absolute w-full z-10 flex justify-center items-center h-full">
								<button
									className="bg-teal-600 rounded-full p-3 text-white"
									onClick={startGame}
								>
									Start Game
								</button>
							</div>
						)}
						<div className={`${blur && "blur-md"}`}>
							<div className="p-4">
								<h2 className="text-center text-xl pb-1">
									Sort these players by their{" "}
									<span className="font-bold">Career PPG</span>
								</h2>
								<div className="pb-5 font-bold text-xl text-teal-700 relative flex gap-2 justify-center items-center">
									{revealAnswer && (
										<button
											onClick={share}
											className="absolute left-0 font-normal text-base bg-teal-600 rounded-full px-3 py-2 text-white transition-all hover:scale-105 flex gap-2 items-center"
										>
											Share <RiShare2Line className="inline" />
										</button>
									)}
									<p>{time / 1000}</p>
									<div className="absolute flex justify-center w-full">
										{penality && (
											<motion.p
												animate={{ scale: [2, 1] }}
												transition={{ ease: "easeOut", duration: 2 }}
												className="text-red-600 text-2xl -mr-16 -mt-7 -rotate-12"
											>
												+5
											</motion.p>
										)}
									</div>
								</div>
								<Droppable droppableId="players">
									{(provided: any) => (
										<div
											className="flex flex-col"
											{...provided.droppableProps}
											ref={provided.innerRef}
										>
											{players?.map((player, i) => (
												<Draggable key={i} draggableId={String(i)} index={i}>
													{(provided: any) => (
														<div
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
															className={`mb-5 rounded-full bg-${
																player.color ? player.color : "gray"
															}-300 border-2 border-gray-600 flex justify-between text-black dark:text-white`}
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
																	{revealAnswer && (
																		<p className="">{player.ppg} PPG</p>
																	)}
																</div>
															</div>
															<div className="flex items-center gap-3 pr-5">
																<button
																	onClick={() => movePlayer(i, "up")}
																	className="bg-cyan-600 border-4 border-black rounded-full p-2"
																>
																	<FaArrowUp className="w-8 h-8" />
																</button>
																<button
																	onClick={() => movePlayer(i, "down")}
																	className="bg-rose-600 border-4 border-black rounded-full p-2"
																>
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
						</div>
						<div className="flex justify-center">
							<button
								className="bg-teal-600 rounded-full p-3 text-white transition-all hover:scale-105 flex gap-2 items-center"
								onClick={() => verifyOrder()}
							>
								Check <FaCheck className="inline" />
							</button>
						</div>
					</div>
				)}
			</DragDropContext>
		</main>
	);
}
