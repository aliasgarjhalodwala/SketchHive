"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import ConfirmModal from "./confirm-modal";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionsProps {
	children: React.ReactNode;
	side?: DropdownMenuContentProps["side"];
	sideOffset?: DropdownMenuContentProps["sideOffset"];
	id: string;
	title: string;
}

const Actions = ({ children, side, sideOffset, id, title }: ActionsProps) => {
	const { onOpen } = useRenameModal();
	const { mutate, isPending } = useApiMutation(api.board.remove);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(
				`${window.location.origin}/board/${id}`
			);
			toast.success("Link copied");
		} catch (error: any) {
			toast.error("Failed to copy link");
		}
	};

	const handleRename = () => {
		onOpen(id, title);
	};

	const handleDelete = async () => {
		try {
			mutate({ boardId: id });
			toast.success("Board deleted");
		} catch (error: any) {
			toast.error("Failed to delete board");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent
				onClick={(e) => e.stopPropagation()}
				side={side}
				sideOffset={sideOffset}
				className="w-60"
			>
				<DropdownMenuItem
					className="p-3 cursor-pointer"
					onClick={handleCopyLink}
				>
					<Link2 className="h-4 w-4 mr-2" />
					Copy Board Link
				</DropdownMenuItem>

				<DropdownMenuItem
					className="p-3 cursor-pointer"
					onClick={handleRename}
				>
					<Pencil className="h-4 w-4 mr-2" />
					Rename
				</DropdownMenuItem>

				<ConfirmModal
					header="Delete board?"
					description="This will delete the board and all of its contents"
					disabled={isPending}
					handleConfirm={handleDelete}
				>
					<Button
						variant="ghost"
						className="p-3 cursor-pointer text-sm w-full justify-start"
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Delete
					</Button>
				</ConfirmModal>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
export default Actions;
