import { type ModelMessage, stepCountIs, streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { webSearchToolset } from "@/tools/web-search";
import { WEB_SEARCH_AGENT_PROMPT } from "./prompt";

export function webSearchAgent(messages: ModelMessage[]) {
	return streamText({
		model: openrouter("google/gemini-3.1-flash-lite-preview"),
		system: WEB_SEARCH_AGENT_PROMPT,
		messages,
		tools: {
			...webSearchToolset,
		},
		stopWhen: [stepCountIs(10)],
	});
}
