import { type ModelMessage, stepCountIs, streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { VIDEO_AGENT_PROMPT } from "./prompt";
import { createVideoAgentTools } from "./tools";

export function videoAgent(messages: ModelMessage[], userId: string, chatId: string) {
	return streamText({
		model: openrouter("google/gemini-3.1-flash-lite-preview"),
		system: VIDEO_AGENT_PROMPT,
		messages,
		tools: createVideoAgentTools(userId, chatId),
		stopWhen: [stepCountIs(15)],
	});
}
