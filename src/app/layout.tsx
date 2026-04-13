import { ClerkProvider } from "@clerk/nextjs";
import { Plus_Jakarta_Sans, Source_Sans_3 } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { metadata as siteMetadata } from "./metadata";
import "./globals.css";

// Modern SaaS typography pairing
const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-heading",
	display: "swap",
	weight: ["400", "500", "600", "700"],
});

const sourceSans3 = Source_Sans_3({
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
	weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
	themeColor: "#050507",
};

export const metadata = {
	...siteMetadata,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body
					className={`${plusJakartaSans.variable} ${sourceSans3.variable} bg-background font-body antialiased`}
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
