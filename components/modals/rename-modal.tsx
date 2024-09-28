"use client";

import { useRenameModal } from "@/store/use-rename-modal";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { FormEventHandler, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const RenameModal = () => {
	const { mutate, isPending } = useApiMutation(api.board.rename);
	const { isOpen, onClose, initialValues } = useRenameModal();
	const [title, setTitle] = useState(initialValues.title);

	useEffect(() => {
		setTitle(initialValues.title);
	}, [initialValues.title]);

	const handleRename: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		try {
			await mutate({ boardId: initialValues.id, title });
			toast.success("Board renamed");
			onClose();
		} catch (error) {
			toast.error("Failed to rename board");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="bg-white">
				<DialogHeader>
					<DialogTitle>Edit board title</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					Enter a new title for this board
				</DialogDescription>
				<form onSubmit={handleRename} className="space-y-4">
					<Input
						disabled={isPending}
						required
						maxLength={60}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Board Title"
					/>
					<DialogFooter>
						<DialogClose>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button disabled={isPending} type="submit">
							Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
export default RenameModal;
