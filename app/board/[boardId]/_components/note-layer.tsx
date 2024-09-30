import { Kalam } from "next/font/google";
import { useMutation } from "@liveblocks/react/suspense";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { NoteLayer } from "@/types/canvas";
import { cn, getContrastColor, rgbToHex } from "@/lib/utils";
import { colors } from "@/constants/picker-colors";

const font = Kalam({
	subsets: ["latin"],
	weight: ["400"],
});

interface NoteProps {
	id: string;
	layer: NoteLayer;
	onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
	selectionColor?: string;
}

const calculateFontSize = (width: number, height: number) => {
	const maxFontSize = 96;
	const scaleFactor = 0.2;
	const fontSizeBasedOnHeight = height * scaleFactor;
	const fontSizeBasedOnWidth = width * scaleFactor;

	return Math.min(fontSizeBasedOnWidth, fontSizeBasedOnHeight, maxFontSize);
};

const Note = ({ id, layer, onLayerPointerDown, selectionColor }: NoteProps) => {
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
				backgroundColor: fill ? rgbToHex(fill) : rgbToHex(colors[1]),
			}}
			className="shadow-md drop-shadow-xl"
		>
			<ContentEditable
				html={value || "Text"}
				onChange={handleContentChange}
				className={cn(
					"h-full w-full flex items-center justify-center text-center outline-none",
					font.className
				)}
				style={{
					fontSize: calculateFontSize(width, height),
					color: fill ? getContrastColor(fill) : "#000",
				}}
			/>
		</foreignObject>
	);
};

export default Note;
