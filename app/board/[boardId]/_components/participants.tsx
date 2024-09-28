"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";

import UserAvatar from "./user-avatar";
import { connIdToColor } from "@/lib/utils";

const MAX_USERS = 2;

const Participants = () => {
	const users = useOthers();
	const currUser = useSelf();
	return (
		<div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md">
			<div className="flex gap-x-2">
				{users.slice(0, MAX_USERS).map(({ connectionId, info }) => (
					<UserAvatar
						key={connectionId}
						src={info?.picture}
						name={info?.name || "Teammate"}
						fallback={info?.name?.[0] || "T"}
						borderColor={connIdToColor(connectionId)}
					/>
				))}
				{currUser && (
					<UserAvatar
						src={currUser?.info?.picture}
						name={`${currUser?.info?.name} (You)`}
						borderColor={connIdToColor(currUser?.connectionId)}
					/>
				)}

				{users.length > MAX_USERS && (
					<UserAvatar
						name={`${users.length - MAX_USERS} more`}
						fallback={`+${users.length - MAX_USERS}`}
					/>
				)}
			</div>
		</div>
	);
};

export const ParticipantsSkeleton = () => {
	return (
		<div className="absolute h-12 top-2 right-2 bg-white rounded-md shadow-md w-[150px] animate-pulse" />
	);
};

export default Participants;
