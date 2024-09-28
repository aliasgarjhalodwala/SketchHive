import { v } from "convex/values";
import { getAllOrThrow } from "convex-helpers/server/relationships";
import { query } from "./_generated/server";

export const get = query({
	args: {
		orgId: v.string(),
		search: v.optional(v.string()),
		favourites: v.optional(v.string()),
	},
	handler: async (context, args) => {
		const identity = await context.auth.getUserIdentity();
		if (!identity) throw new Error("Unauthorized");

		const userId = identity.subject;

		const favourites = args.favourites as string;
		if (favourites) {
			const favouritedBoards = await context.db
				.query("userFavourites")
				.withIndex("by_user_org", (query) => query.eq("userId", userId))
				.order("desc")
				.collect();

			const ids = favouritedBoards.map((board) => board.boardId);

			const boards = await getAllOrThrow(context.db, ids);

			return boards.map((board) => ({
				...board,
				isFavourite: true,
			}));
		}

		const title = args.search as string;
		let boards = [];

		if (title) {
			boards = await context.db
				.query("boards")
				.withSearchIndex("search_title", (query) =>
					query.search("title", title).eq("orgId", args.orgId)
				)
				.collect();
		} else {
			boards = await context.db
				.query("boards")
				.withIndex("by_org", (query) => query.eq("orgId", args.orgId))
				.order("desc")
				.collect();
		}

		const boardsWithFavouriteRelation = boards.map((board) => {
			return context.db
				.query("userFavourites")
				.withIndex("by_user_board", (query) =>
					query.eq("userId", userId).eq("boardId", board._id)
				)
				.unique()
				.then((favourite) => {
					return {
						...board,
						isFavourite: !!favourite,
					};
				});
		});

		const boardsWithFavouriteBoolean = Promise.all(
			boardsWithFavouriteRelation
		);

		return boardsWithFavouriteBoolean;
	},
});
