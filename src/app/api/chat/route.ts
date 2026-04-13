import { openrouter } from "@openrouter/ai-sdk-provider";
import { auth } from "@clerk/nextjs/server";
import {
	convertToModelMessages,
	createIdGenerator,
	type ModelMessage,
	streamText,
	type UIMessage,
} from "ai";
import { type NextRequest } from "next/server";
import { webSearchAgent } from "@/agents/web-search-agent";
import { videoAgent } from "@/agents/video-agent";
import { loadChat, saveChat } from "@/lib/chat-store";

export async function POST(request: NextRequest) {
	// Get authenticated user ID
	const { userId } = await auth();

	if (!userId) {
		return new Response("Unauthorized", { status: 401 });
	}

	const body = await request.json();
	const id = body.id;
	const searchMode = body.searchMode ?? false; // Default to false if not provided
	const videoMode = body.videoMode ?? false; // Video mode for video generation

	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "route.ts:23",
			message: "API request received",
			data: { id, searchMode, videoMode, hasSearchMode: body.searchMode !== undefined, hasVideoMode: body.videoMode !== undefined },
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "G",
		}),
	}).catch(() => {});
	// #endregion

	if (!id) {
		return new Response("Chat ID is required", { status: 400 });
	}

	// Support both sending all messages or just the last message (optimization)
	// If 'message' is provided, load previous messages and append it
	// Otherwise, use all 'messages' (backward compatibility)
	let messages: UIMessage[];
	if (body.message) {
		// Load previous messages from storage and append the new message
		const previousMessages = await loadChat(id, userId);
		messages = [...previousMessages, body.message];
	} else if (body.messages) {
		// Backward compatibility: use all messages if provided
		messages = body.messages;
	} else {
		// Load existing messages or start fresh
		messages = await loadChat(id, userId);
	}

	// Convert to model messages for the AI SDK
	const modelMessages: ModelMessage[] = await convertToModelMessages(messages);

	// Determine which agent to use based on mode
	// Priority: videoMode > searchMode > default
	let streamTextResult;
	let agentType: string;

	if (videoMode) {
		streamTextResult = videoAgent(modelMessages, userId, id);
		agentType = "videoAgent";
	} else if (searchMode) {
		streamTextResult = webSearchAgent(modelMessages);
		agentType = "webSearchAgent";
	} else {
		streamTextResult = streamText({
			model: openrouter("google/gemini-3.1-flash-lite-preview"),
			system:
				"You are a helpful AI assistant. Provide clear, accurate, and concise responses to user questions.",
			messages: modelMessages,
			// No tools when searchMode is disabled
		});
		agentType = "streamText";
	}

	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "route.ts:51",
			message: "Agent selected",
			data: {
				searchMode,
				videoMode,
				agentType,
			},
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "G",
		}),
	}).catch(() => {});
	// #endregion

	// Consume stream to ensure it runs to completion even if client disconnects
	// This ensures onFinish is called and messages are persisted
	streamTextResult.consumeStream();

	return streamTextResult.toUIMessageStreamResponse({
		originalMessages: messages,
		// Generate consistent server-side IDs for persistence
		generateMessageId: createIdGenerator({
			prefix: "msg",
			size: 16,
		}),
		onFinish: async ({ messages }) => {
			try {
				await saveChat({ chatId: id, messages, userId });
			} catch (error) {
				// Log error but don't fail the request
				// The response has already been sent, so we can't return an error
				console.error(`Failed to persist chat ${id}:`, error);
				// In production, you might want to:
				// - Send to error tracking service (Sentry, etc.)
				// - Queue for retry
				// - Notify admin
			}
		},
	});
}
