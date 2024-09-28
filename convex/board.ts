import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const images = [
	"/placeholders/1.svg",
	"/placeholders/2.svg",
	"/placeholders/3.svg",
	"/placeholders/4.svg",
	"/placeholders/5.svg",
	"/placeholders/6.svg",
	"/placeholders/7.svg",
	"/placeholders/8.svg",
	"/placeholders/9.svg",
	"/placeholders/10.svg",
];

export const create = mutation({
	args: {
		orgId: v.string(),
		title: v.string(),
	},
	handler: async (context, args) => {
		const identity = await context.auth.getUserIdentity();
		if (!identity) throw new Error("Unauthorized");

		const randomImage = images[Math.floor(Math.random() * images.length)];

		const board = await context.db.insert("boards", {
			title: args.title,
			orgId: args.orgId,
			authorId: identity.subject,
			authorName: identity.name!,
			imageUrl: randomImage,
		});

		return board;
	},
});

export const remove = mutation({
	args: {
		boardId: v.id("boards"),
	},
	handler: async (context, args) => {
		const identity = await context.auth.getUserIdentity();
		if (!identity) throw new Error("Unauthorized");

		const userId = identity.subject;

		const existingFavourite = await context.db
			.query("userFavourites")
			.withIndex("by_user_board", (query) =>
				query.eq("userId", userId).eq("boardId", args.boardId)
			)
			.unique();

		if (existingFavourite) {
			await context.db.delete(existingFavourite._id);
		}

		await context.db.delete(args.boardId);
	},
});

export const rename = mutation({
	args: {
		boardId: v.id("boards"),
		title: v.string(),
	},
	handler: async (context, args) => {
		const identity = await context.auth.getUserIdentity();
		if (!identity) throw new Error("Unauthorized");

		const title = args.title.trim();
		if (!title) {
			throw new Error("Title is required");
		}
		if (title.length > 60) {
			throw new Error("Title cannot be longer than 60 characters");
		}

		const board = await context.db.patch(args.boardId, { title });
		return board;
	},
});

export const toggleFavourite = mutation({
	args: { boardId: v.id("boards") },
	handler: async (context, args) => {
		const identity = await context.auth.getUserIdentity();
		if (!identity) throw new Error("Unauthorized");

		const board = await context.db.get(args.boardId);
		if (!board) throw new Error("Board not found");

		const userId = identity.subject;

		const existingFavourite = await context.db
			.query("userFavourites")
			.withIndex("by_user_board", (query) =>
				query.eq("userId", userId).eq("boardId", args.boardId)
			)
			.unique();

		if (!existingFavourite) {
			await context.db.insert("userFavourites", {
				userId,
				boardId: board._id,
				orgId: board.orgId,
			});
		} else {
			await context.db.delete(existingFavourite._id);
		}

		return board;
	},
});

export const get = query({
	args: { boardId: v.id("boards") },
	handler: async (context, args) => {
		const board = await context.db.get(args.boardId);
		return board;
	},
});
