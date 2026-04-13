"use client";

import { MoreHorizontal, Pencil, PlusIcon, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { ChatMetadata } from "@/lib/chat-store";
import { Icons } from "../icons";
import { ThemeToggle } from "../theme-toggle";
import { NavUser } from "./nav-user";

// Group chats by time periods
function groupChatsByPeriod(chats: ChatMetadata[]) {
	const now = Date.now();
	const oneDay = 24 * 60 * 60 * 1000;
	const sevenDays = 7 * oneDay;
	const thirtyDays = 30 * oneDay;

	const groups: {
		period: string;
		chats: ChatMetadata[];
	}[] = [
		{ period: "Today", chats: [] },
		{ period: "Yesterday", chats: [] },
		{ period: "Last 7 days", chats: [] },
		{ period: "Last month", chats: [] },
		{ period: "Older", chats: [] },
	];

	chats.forEach((chat) => {
		const diff = now - chat.timestamp;

		if (diff < oneDay) {
			groups[0].chats.push(chat);
		} else if (diff < 2 * oneDay) {
			groups[1].chats.push(chat);
		} else if (diff < sevenDays) {
			groups[2].chats.push(chat);
		} else if (diff < thirtyDays) {
			groups[3].chats.push(chat);
		} else {
			groups[4].chats.push(chat);
		}
	});

	// Remove empty groups
	return groups.filter((group) => group.chats.length > 0);
}

export function ChatSidebar({ currentChatId }: { currentChatId?: string }) {
	const router = useRouter();
	const [chats, setChats] = useState<ChatMetadata[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingChatId, setEditingChatId] = useState<string | null>(null);
	const [editingTitle, setEditingTitle] = useState("");
	const editInputRef = useRef<HTMLInputElement>(null);

	// Fetch chats from API
	useEffect(() => {
		async function fetchChats() {
			try {
				const response = await fetch("/api/chats");
				if (response.ok) {
					const data = await response.json();
					setChats(data);
				}
			} catch (error) {
				console.error("Failed to fetch chats:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchChats();

		// Refresh chats periodically (every 30 seconds)
		const interval = setInterval(fetchChats, 30000);
		return () => clearInterval(interval);
	}, []);

	// Focus input when editing starts
	useEffect(() => {
		if (editingChatId && editInputRef.current) {
			editInputRef.current.focus();
			editInputRef.current.select();
		}
	}, [editingChatId]);

	const handleNewChat = () => {
		// Navigate to /chat which will create a new chat and redirect
		router.push("/chat");
	};

	const handleDeleteChat = async (chatId: string) => {
		try {
			const response = await fetch(`/api/chats/${chatId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setChats((prev) => prev.filter((chat) => chat.id !== chatId));
				if (currentChatId === chatId) {
					router.push("/chat");
				}
			} else {
				console.error("Failed to delete chat");
			}
		} catch (error) {
			console.error("Failed to delete chat:", error);
		}
	};

	const startEditing = (chat: ChatMetadata) => {
		setEditingChatId(chat.id);
		setEditingTitle(chat.title);
	};

	const handleRenameChat = async (chatId: string) => {
		if (!editingTitle.trim()) {
			setEditingChatId(null);
			return;
		}

		try {
			const response = await fetch(`/api/chats/${chatId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: editingTitle.trim() }),
			});

			if (response.ok) {
				setChats((prev) =>
					prev.map((chat) =>
						chat.id === chatId
							? { ...chat, title: editingTitle.trim() }
							: chat,
					),
				);
			} else {
				console.error("Failed to rename chat");
			}
		} catch (error) {
			console.error("Failed to rename chat:", error);
		} finally {
			setEditingChatId(null);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
		if (e.key === "Enter") {
			handleRenameChat(chatId);
		} else if (e.key === "Escape") {
			setEditingChatId(null);
		}
	};

	const groupedChats = groupChatsByPeriod(chats);

	return (
		<Sidebar>
			<SidebarHeader className="flex flex-row items-center justify-between gap-2 border-b px-4 py-3">
				<div className="flex flex-row items-center gap-2">
					<div className="flex flex-row items-center gap-2 font-base text-md text-primary tracking-tight">
						<Link href="/" className="flex flex-row items-center gap-2">
							<Icons.logo className="size-8" />
							<span className="font-base text-md text-primary tracking-tight">
								AgentKit
							</span>
						</Link>
					</div>
				</div>
				<Button variant="ghost" className="size-8 p-0">
					<Search className="size-4" />
				</Button>
			</SidebarHeader>
			<SidebarContent className="px-2 py-3">
				<div className="mb-2 px-2">
					<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
						<Button
							variant="outline"
							className="flex h-9 w-full items-center gap-2 border-dashed border-border/60 bg-background/50 transition-all duration-200 hover:border-border hover:bg-accent"
							onClick={handleNewChat}
						>
							<PlusIcon className="size-4" />
							<span>New Chat</span>
						</Button>
					</motion.div>
				</div>
				{isLoading ? (
					<div className="px-4 py-3 text-muted-foreground text-sm">
						Loading chats...
					</div>
				) : groupedChats.length === 0 ? (
					<div className="px-4 py-3 text-muted-foreground text-sm">
						No chats yet. Start a new conversation!
					</div>
				) : (
					<AnimatePresence>
						{groupedChats.map((group, groupIndex) => (
							<motion.div
								key={group.period}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: groupIndex * 0.05, duration: 0.2 }}
							>
								<SidebarGroup className="mb-4 last:mb-0">
									<SidebarGroupLabel className="px-4 py-2 font-semibold text-muted-foreground/80 text-xs uppercase tracking-widest">
										{group.period}
									</SidebarGroupLabel>
									<SidebarMenu className="px-2">
										{group.chats.map((chat, chatIndex) => (
											<motion.div
												key={chat.id}
												initial={{ opacity: 0, x: -8 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: chatIndex * 0.03, duration: 0.15 }}
												className="group relative flex items-center"
											>
												<SidebarMenuButton
													asChild
													isActive={currentChatId === chat.id}
													className="h-auto flex-1 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-accent/60 data-[active=true]:bg-accent data-[active=true]:shadow-sm"
												>
													<Link href={`/chat/${chat.id}`} className="w-full">
														<div className="flex w-full min-w-0 flex-col items-start gap-0.5">
															{editingChatId === chat.id ? (
																<Input
																	ref={editInputRef}
																	value={editingTitle}
																	onChange={(e) => setEditingTitle(e.target.value)}
																	onBlur={() => handleRenameChat(chat.id)}
																	onKeyDown={(e) => handleKeyDown(e, chat.id)}
																	className="h-6 w-full border-white/30 px-1 py-0 text-sm focus-visible:ring-white/20"
																/>
															) : (
																<>
																	<span className="w-full truncate text-sm font-medium leading-tight text-foreground/90">
																		{chat.title}
																	</span>
																	<span className="w-full truncate text-muted-foreground/70 text-xs leading-tight">
																		{chat.lastMessage}
																	</span>
																</>
															)}
														</div>
													</Link>
												</SidebarMenuButton>
												{editingChatId !== chat.id && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="absolute right-1 top-1/2 size-6 -translate-y-1/2 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
															>
																<MoreHorizontal className="size-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={() => startEditing(chat)}
																className="gap-2"
															>
																<Pencil className="size-4" />
																Rename
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => handleDeleteChat(chat.id)}
																className="gap-2 text-destructive focus:text-destructive"
															>
																<Trash2 className="size-4" />
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												)}
											</motion.div>
										))}
									</SidebarMenu>
								</SidebarGroup>
							</motion.div>
						))}
					</AnimatePresence>
				)}
			</SidebarContent>
			<div className="px-4 py-3">
				<ThemeToggle />
			</div>

			<SidebarFooter className="flex flex-col gap-2 border-t px-4 py-3">
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
