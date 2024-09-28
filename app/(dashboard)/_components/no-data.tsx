"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";

const NoData = () => {
	const router = useRouter();
	const { organization } = useOrganization();
	const { mutate, isPending } = useApiMutation(api.board.create);

	const handleClick = async () => {
		if (!organization) return;

		try {
			const boardId = await mutate({
				orgId: organization.id,
				title: " Untitled",
			});
			toast.success("Board Created");
			router.push(`/board/${boardId}`);
		} catch (error: any) {
			toast.error("Failed to create board", error.message);
		}
	};

	return (
		<div className="h-full flex flex-col items-center justify-center">
			<Image src="/no-data.svg" alt="No data" width={170} height={170} />
			<h2 className="text-2xl font-semibold mt-6">
				Create your first board!
			</h2>
			<p className="text-muted-foreground text-sm mt-2">
				Start by creating a board for your organization
			</p>
			<div className="mt-6">
				<Button disabled={isPending} size="lg" onClick={handleClick}>
					Create board
				</Button>
			</div>
		</div>
	);
};
export default NoData;
