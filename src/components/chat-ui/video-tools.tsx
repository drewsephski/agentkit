"use client";

import { useEffect, useState } from "react";
import type { UIMessage } from "@ai-sdk/react";

type MessagePart = NonNullable<UIMessage["parts"]>[number];

type VideoToolCall = MessagePart & {
	type: string;
	toolCallId?: string;
	toolName?: string;
	input?: unknown;
};

type VideoToolResult = MessagePart & {
	type: string;
	toolCallId?: string;
	result?: {
		jobId?: string;
		status?: string;
		progress?: number;
		downloadUrl?: string;
		outputUrl?: string;
		error?: string;
	};
};

// Video tool names from tools.ts (AI SDK adds 'tool-' prefix)
const VIDEO_TOOL_NAMES = [
	"tool-createProject",
	"tool-updateProject",
	"tool-renderPreview",
	"tool-renderFinal",
	"tool-getRenderStatus",
];

// Helper function to extract video tool calls and results
export function extractVideoTools(message: UIMessage) {
	if (!message.parts) {
		return { videoToolCalls: [], videoToolResults: [] };
	}

	const parts = message.parts as MessagePart[];

	const videoToolCalls = parts.filter((part): part is VideoToolCall => {
		const partType = (part as { type?: string }).type;
		const isVideoTool = VIDEO_TOOL_NAMES.includes(partType || "");
		return isVideoTool && ("input" in part || "args" in part);
	});

	// Deduplicate by toolCallId
	const toolCallMap = new Map<string, VideoToolCall>();
	videoToolCalls.forEach((tc) => {
		if (tc.toolCallId) {
			toolCallMap.set(tc.toolCallId, tc);
		}
	});
	const uniqueToolCalls = Array.from(toolCallMap.values());

	const toolCallIds = new Set<string>(
		uniqueToolCalls
			.map((tc) => tc.toolCallId)
			.filter((id): id is string => Boolean(id)),
	);

	const videoToolResults = parts.filter((part): part is VideoToolResult => {
		const partType = (part as { type?: string }).type;
		const { toolCallId } = part as { toolCallId?: string };
		const hasResult = "result" in part;
		const isVideoTool = VIDEO_TOOL_NAMES.includes(partType || "");
		return (
			isVideoTool &&
			hasResult &&
			typeof toolCallId === "string" &&
			toolCallIds.has(toolCallId)
		);
	});

	return { videoToolCalls: uniqueToolCalls, videoToolResults };
}

// Component to render video tool results with polling
export function VideoToolUI({
	toolName,
	result: initialResult,
}: {
	toolName: string;
	result?: VideoToolResult["result"];
}) {
	const [result, setResult] = useState(initialResult);
	const [isPolling, setIsPolling] = useState(false);

	// Poll for status updates when rendering
	useEffect(() => {
		if (!result?.jobId) return;
		
		const status = result.status;
		const shouldPoll = status === "PENDING" || status === "RENDERING";
		
		if (!shouldPoll) return;

		setIsPolling(true);
		
		const pollInterval = setInterval(async () => {
			try {
				const response = await fetch(`/api/video/status/${result.jobId}`);
				if (!response.ok) return;
				
				const data = await response.json();
				
				// Update result with new status
				setResult(prev => ({
					...prev,
					...data,
				}));
				
				// Stop polling if completed or failed
				if (data.status === "COMPLETED" || data.status === "FAILED") {
					clearInterval(pollInterval);
					setIsPolling(false);
				}
			} catch (err) {
				console.error("[VideoToolUI] Error polling status:", err);
			}
		}, 2000); // Poll every 2 seconds

		return () => {
			clearInterval(pollInterval);
			setIsPolling(false);
		};
	}, [result?.jobId, result?.status]);

	// Update result when initialResult changes (from new tool calls)
	useEffect(() => {
		setResult(initialResult);
	}, [initialResult]);

	if (!result) {
		return (
			<div className="space-y-2 rounded-xl border border-border/50 bg-card/50 p-4">
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<span className="text-sm font-medium">{toolName}: Starting...</span>
				</div>
			</div>
		);
	}

	const { status, progress, downloadUrl, error } = result;

	if (error) {
		return (
			<div className="space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
				<div className="flex items-center gap-2 text-red-600">
					<span className="text-sm font-medium">❌ {toolName}: {error}</span>
				</div>
			</div>
		);
	}

	if (status === "COMPLETED" && downloadUrl) {
		return (
			<div className="space-y-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
				<div className="flex items-center gap-2 text-green-600">
					<span className="text-lg">✅</span>
					<span className="text-sm font-medium">{toolName}: Complete!</span>
				</div>
				<video
					controls
					className="w-full max-w-md rounded-lg"
					src={downloadUrl}
					preload="metadata"
				>
					Your browser does not support the video tag.
				</video>
			</div>
		);
	}

	if (status === "RENDERING" || status === "PENDING") {
		const progressPercent = progress ?? 0;
		return (
			<div className="space-y-2 rounded-xl border border-border/50 bg-card/50 p-4">
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<span className="text-sm font-medium">
						{toolName}: {status === "PENDING" ? "Queued..." : `Rendering (${progressPercent}%)...`}
					</span>
				</div>
				<div className="h-2 w-full rounded-full bg-muted">
					<div
						className="h-2 rounded-full bg-primary transition-all duration-300"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
			</div>
		);
	}

	return null;
}

// Main component to render all video tools for a message
export function VideoToolsRenderer({
	message,
	index,
}: {
	message: UIMessage;
	index: number;
}) {
	const { videoToolCalls, videoToolResults } = extractVideoTools(message);
	if (videoToolCalls.length === 0) return null;

	return (
		<div className="mt-3 space-y-3">
			{videoToolCalls.map((toolCall) => {
				const toolResult = videoToolResults.find(
					(tr) => tr.toolCallId === toolCall.toolCallId,
				);
				// AI SDK puts the tool name in the type field with 'tool-' prefix
				const toolName =
					toolCall.type?.replace(/^tool-/, "") || "Video Tool";
				const result = toolResult?.result;

				return (
					<VideoToolUI
						key={`${message.id || index}-${toolCall.toolCallId}`}
						toolName={toolName}
						result={result}
					/>
				);
			})}
		</div>
	);
}
