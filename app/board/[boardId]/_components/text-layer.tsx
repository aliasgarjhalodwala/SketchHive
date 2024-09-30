import { Kalam } from "next/font/google";
import { useMutation } from "@liveblocks/react/suspense";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { TextLayer } from "@/types/canvas";
import { cn, rgbToHex } from "@/lib/utils";

const font = Kalam({
	subsets: ["latin"],
	weight: ["400"],
});

interface TextProps {
	id: string;
	layer: TextLayer;
	onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
	selectionColor?: string;
}

const calculateFontSize = (width: number, height: number) => {
	const maxFontSize = 96;
	const scaleFactor = 0.5;
	const fontSizeBasedOnHeight = height * scaleFactor;
	const fontSizeBasedOnWidth = width * scaleFactor;

	return Math.min(fontSizeBasedOnWidth, fontSizeBasedOnHeight, maxFontSize);
};

const Text = ({ id, layer, onLayerPointerDown, selectionColor }: TextProps) => {
	const { x, y, width, height, fill, value } = layer;

	const updateValue = useMutation(({ storage }, newValue: string) => {
		const liveLayers = storage.get("layers");
		liveLayers.get(id)?.set("value", newValue);
	}, []);

	const handleContentChange = (e: ContentEditableEvent) => {
		updateValue(e.target.value);
	};

	return (
		<foreignObject
			x={x}
			y={y}
			width={width}
			height={height}
			onPointerDown={(e) => onLayerPointerDown(e, id)}
			style={{
				outline: selectionColor
					? `1px solid ${selectionColor}`
					: "none",
			}}
		>
			<ContentEditable
				html={value || "Text"}
				onChange={handleContentChange}
				className={cn(
					"h-full w-full flex items-center justify-center text-center drop-shadow-md outline-none",
					font.className
				)}
				style={{
					fontSize: calculateFontSize(width, height),
					color: fill ? rgbToHex(fill) : "#000",
				}}
			/>
		</foreignObject>
	);
};

export default Text;
