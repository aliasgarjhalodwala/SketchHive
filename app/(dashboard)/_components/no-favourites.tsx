import Image from "next/image";

const NoFavourites = () => {
	return (
		<div className="h-full flex flex-col items-center justify-center">
			<Image
				src="/no-favourites.svg"
				alt="No favourites"
				width={230}
				height={230}
			/>
			<h2 className="text-2xl font-semibold mt-6">
				No favourite boards!
			</h2>
			<p className="text-muted-foreground text-sm mt-2">
				Try favouriting a board
			</p>
		</div>
	);
};
export default NoFavourites;
