import { auth } from "@clerk/nextjs/server";
import { type NextRequest } from "next/server";
import { deleteChat, renameChat } from "@/lib/chat-store";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		await deleteChat(id, userId);
		return Response.json({ success: true });
	} catch (error) {
		console.error("Failed to delete chat:", error);
		const message = error instanceof Error ? error.message : "Failed to delete chat";
		const status = message.includes("not found") ? 404 : 500;
		return Response.json({ error: message }, { status });
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const { title } = body;

		if (typeof title !== "string") {
			return Response.json({ error: "Title is required" }, { status: 400 });
		}

		await renameChat(id, title, userId);
		return Response.json({ success: true });
	} catch (error) {
		console.error("Failed to rename chat:", error);
		const message = error instanceof Error ? error.message : "Failed to rename chat";
		const status = message.includes("not found") ? 404 : 500;
		return Response.json({ error: message }, { status });
	}
}
