"use client";

import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { Menu } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import Actions from "@/components/actions";
import { useRenameModal } from "@/store/use-rename-modal";
import { cn } from "@/lib/utils";

interface InfoProps {
	boardId: string;
}

const font = Poppins({
	subsets: ["latin"],
	weight: ["600"],
});

const TabSeperator = () => {
	return <div className="text-neutral-300 px-1.5">|</div>;
};

const Info = ({ boardId }: InfoProps) => {
	const data = useQuery(api.board.get, { boardId: boardId as Id<"boards"> });

	const { onOpen } = useRenameModal();

	if (!data) {
		return <InfoSkeleton />;
	}

	return (
		<div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md select-none">
			<Button variant="ghost">
				<Link href="/" className="flex items-center">
					<Image
						src="/logo.svg"
						alt="Sketchhive logo"
						height={40}
						width={40}
					/>
					<span
						className={cn(
							"font-semibold text-xl ml-2 text-black",
							font.className
						)}
					>
						SketchHive
					</span>
				</Link>
			</Button>

			<TabSeperator />

			<Button
				variant="ghost"
				className="text-base font-normal px-2"
				onClick={() => onOpen(data._id, data.title)}
			>
				{data.title}
			</Button>

			<TabSeperator />

			<Actions
				id={data._id}
				title={data.title}
				side="bottom"
				sideOffset={10}
			>
				<Button size="icon" variant="ghost">
					<Menu />
				</Button>
			</Actions>
		</div>
	);
};

export const InfoSkeleton = () => {
	return (
		<div className="absolute top-2 left-2 bg-white rounded-md h-12 shadow-md w-[300px] animate-pulse" />
	);
};

export default Info;
