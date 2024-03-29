import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "The Daily Dime",
	description: "A daily NBA game all about the numbers.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={lexend.className}>
				<div className="min-h-screen">{children}</div>
			</body>
		</html>
	);
}
