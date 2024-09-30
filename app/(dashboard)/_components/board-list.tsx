"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import EmptySearch from "./empty-search";
import NoFavourites from "./no-favourites";
import NoData from "./no-data";
import BoardCard, { BoardCardSkeleton } from "./board-card";
import NewBoardButton from "./new-board-button";

interface BoardListProps {
	orgId: string;
	query: {
		search?: string;
		favourites?: string;
	};
}

const BoardList = ({ orgId, query }: BoardListProps) => {
	const data = useQuery(api.boards.get, { orgId, ...query });

	if (data === undefined) {
		return (
			<div>
				<h2 className="text-3xl">
					{query.favourites ? "Favourite boards" : "Team boards"}
				</h2>
				<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6 gap-5 mt-8 pb-10">
					<NewBoardButton orgId={orgId} disabled={true} />
					{[...Array(7)].map((_, index) => (
						<BoardCardSkeleton key={index} />
					))}
				</div>
			</div>
		);
	}

	if (!data?.length && query.search) {
		return <EmptySearch />;
	}

	if (!data?.length && query.favourites) {
		return <NoFavourites />;
	}

	if (!data?.length) {
		return <NoData />;
	}

	return (
		<div>
			<h2 className="text-3xl">
				{query.favourites ? "Favourite boards" : "Team boards"}
			</h2>
			<div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6 gap-5 mt-8 pb-10">
				<NewBoardButton orgId={orgId} />
				{data.map((board) => (
					<BoardCard
						key={board._id}
						id={board._id}
						title={board.title}
						imageUrl={board.imageUrl}
						authorId={board.authorId}
						authorName={board.authorName}
						createdAt={board._creationTime}
						isFavourite={board.isFavourite}
					/>
				))}
			</div>
		</div>
	);
};

export default BoardList;
