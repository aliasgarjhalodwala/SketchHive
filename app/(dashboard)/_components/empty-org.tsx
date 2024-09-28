import Image from "next/image";
import { CreateOrganization } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const EmptyOrg = () => {
	return (
		<div className="h-full flex flex-col items-center justify-center ">
			<Image
				src="/empty-org.svg"
				alt="Empty organization"
				width={300}
				height={300}
			/>
			<h2 className="text-2xl font-semibold mt-6">
				Welcome to SketchHive!
			</h2>
			<p className="text-muted-foreground text-sm mt-2">
				Create an organization to get started
			</p>

			<div className="mt-6">
				<Dialog>
					<DialogTrigger asChild>
						<Button size="lg">Create organization</Button>
					</DialogTrigger>
					<DialogContent className="bg-transparent border-none max-w-[480px]">
						<CreateOrganization routing="hash" />
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};
export default EmptyOrg;
