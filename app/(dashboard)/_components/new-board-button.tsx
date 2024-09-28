"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";

interface NewBoardButtonProps {
	orgId: string;
	disabled?: boolean;
}

const NewBoardButton = ({ orgId, disabled }: NewBoardButtonProps) => {
	const router = useRouter();
	const { mutate, isPending } = useApiMutation(api.board.create);

	const handleClick = async () => {
		try {
			const boardId = await mutate({ orgId, title: "Untitled" });
			toast.success("Board Created");
			router.push(`/board/${boardId}`);
		} catch (error: any) {
			toast.error("Failed to create board", error.message);
		}
	};

	return (
		<Button
			disabled={disabled}
			onClick={handleClick}
			className={cn(
				"col-span-1 h-full aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
				(isPending || disabled) &&
					"opacity-75 hover:bg-blue-600 cursor-not-allowed"
			)}
		>
			<Plus className="h-12 w-12 text-white stroke-1" />
			<p className="text-sm text-white font-light">New Board</p>
		</Button>
	);
};
export default NewBoardButton;
