import type { UIDataTypes, UIMessagePart, UITools } from "ai";
import {
	ArrowUp,
	Code,
	Globe,
	Image,
	Mic,
	MoreHorizontal,
	Paperclip,
	Plus,
	Sparkles,
	Video,
	X,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";

interface ChatInputProps {
	isLoading: boolean;
	stop: () => void;
	onSubmit: (message: { parts: UIMessagePart<UIDataTypes, UITools>[] }) => void;
	className?: string;
}

export function ChatInput({
	isLoading,
	stop,
	onSubmit,
	className,
}: ChatInputProps) {
	const [input, setInput] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [searchMode, setSearchMode] = useState(false);
	const [videoMode, setVideoMode] = useState(false);
	const uploadInputRef = useRef<HTMLInputElement>(null);

	const fileToDataURL = (file: File) =>
		new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error("Failed to read file"));
			reader.readAsDataURL(file);
		});

	const handleSubmit = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		const text = input?.trim();

		if (!text && files.length === 0) return;

		// clear input optimistically
		setInput("");
		setFiles([]);
		if (uploadInputRef.current) uploadInputRef.current.value = "";

		try {
			// build parts: include text part if present, and file parts for each file
			const parts: Array<UIMessagePart<UIDataTypes, UITools>> = [];
			if (text) parts.push({ type: "text", text });

			for (const file of files) {
				// convert file to data url
				const dataUrl = await fileToDataURL(file);
				parts.push({
					type: "file",
					mediaType: file.type,
					filename: file.name,
					url: dataUrl,
				});
			}

			// Pass mode flags as metadata in the message
			onSubmit({
				parts,
				// Add mode flags as custom properties that will be passed through
				searchMode,
				videoMode,
			} as {
				parts: Array<UIMessagePart<UIDataTypes, UITools>>;
				searchMode: boolean;
				videoMode: boolean;
			});
		} catch (err) {
			console.error("Failed to process message:", err);
			// Restore input if error occurs (optional, but good UX)
			if (text) setInput(text);
		}
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			const newFiles = Array.from(event.target.files);
			setFiles((prev) => [...prev, ...newFiles]);
		}
	};

	const handleRemoveFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		if (uploadInputRef.current) {
			uploadInputRef.current.value = "";
		}
	};

	return (
		<div className={className}>
			<div className="mx-auto max-w-3xl">
				<PromptInput
					isLoading={isLoading}
					value={input}
					onValueChange={setInput}
					onSubmit={handleSubmit}
					className="relative z-10 w-full rounded-3xl border border-input bg-popover p-0 pt-1 shadow-xs"
				>
					{/* Files preview */}
					{files.length > 0 && (
						<div className="flex flex-wrap gap-2 px-4 pt-2">
							{files.map((file, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
									className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-foreground text-sm"
									onClick={(e: React.MouseEvent) => e.stopPropagation()}
								>
									<Paperclip className="h-4 w-4 text-muted-foreground" />
									<span className="max-w-[160px] truncate font-medium">
										{file.name}
									</span>
									<button
										type="button"
										onClick={() => handleRemoveFile(index)}
										className="rounded-full p-1 transition hover:bg-secondary"
										aria-label={`Remove ${file.name}`}
									>
										<X className="h-4 w-4 text-muted-foreground" />
									</button>
								</motion.div>
							))}
						</div>
					)}

					<div className="flex flex-col">
						<PromptInputTextarea
							placeholder="Ask anything"
							className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
						/>

						<PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
							<div className="flex items-center gap-2">
								<PromptInputAction tooltip="Add a new action">
									<Button
										variant="outline"
										size="icon"
										className="size-9 rounded-full"
										onClick={() => uploadInputRef.current?.click()}
									>
										<Plus size={18} />
									</Button>
								</PromptInputAction>
								<input
									type="file"
									multiple
									onChange={handleFileChange}
									className="hidden"
									ref={uploadInputRef}
									aria-label="File upload"
								/>

								<PromptInputAction
									tooltip={
										videoMode ? "Disable video mode" : "Enable video mode"
									}
								>
									<Button
										variant={videoMode ? "default" : "outline"}
										className="rounded-full"
										onClick={() => {
											setVideoMode(!videoMode);
											if (searchMode) setSearchMode(false);
										}}
										type="button"
									>
										<Video size={18} />
										Video
									</Button>
								</PromptInputAction>
								<PromptInputAction
									tooltip={
										searchMode ? "Disable web search" : "Enable web search"
									}
								>
									<Button
										variant={searchMode ? "default" : "outline"}
										className="rounded-full"
										onClick={() => {
											setSearchMode(!searchMode);
											if (videoMode) setVideoMode(false);
										}}
										type="button"
									>
										<Globe size={18} />
										Search
									</Button>
								</PromptInputAction>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="size-9 rounded-full"
										>
											<MoreHorizontal size={18} />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-56">
										<DropdownMenuLabel>Agent Actions</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => {
												setSearchMode(!searchMode);
												if (videoMode) setVideoMode(false);
											}}
											className="gap-2"
										>
											<Globe className="size-4" />
											<span>Web Search</span>
											{searchMode && (
												<span className="ml-auto text-xs text-muted-foreground">
													Active
												</span>
											)}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => {
												setVideoMode(!videoMode);
												if (searchMode) setSearchMode(false);
											}}
											className="gap-2"
										>
											<Video className="size-4" />
											<span>Video Mode</span>
											{videoMode && (
												<span className="ml-auto text-xs text-muted-foreground">
													Active
												</span>
											)}
										</DropdownMenuItem>
										<DropdownMenuItem className="gap-2" disabled>
											<Code className="size-4" />
											<span>Code Interpreter</span>
										</DropdownMenuItem>
										<DropdownMenuItem className="gap-2" disabled>
											<Image className="size-4" />
											<span>Image Generation</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuLabel>Capabilities</DropdownMenuLabel>
										<DropdownMenuItem className="gap-2" disabled>
											<Sparkles className="size-4" />
											<span>Deep Research</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="flex items-center gap-2">
								<PromptInputAction tooltip="Voice input">
									<Button
										variant="outline"
										size="icon"
										className="size-9 rounded-full"
									>
										<Mic size={18} />
									</Button>
								</PromptInputAction>

								<Button
									size="icon"
									disabled={!input.trim() || isLoading}
									onClick={handleSubmit}
									className="size-9 rounded-full"
								>
									{!isLoading ? (
										<ArrowUp size={18} />
									) : (
										<span className="size-3 rounded-xs bg-white" />
									)}
								</Button>
							</div>
						</PromptInputActions>
					</div>
				</PromptInput>
			</div>
		</div>
	);
}
