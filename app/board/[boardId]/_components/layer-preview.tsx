"use client";

import { memo } from "react";
import { useStorage } from "@liveblocks/react/suspense";

import Rectangle from "./rectangle";
import Ellipse from "./ellipse";
import Text from "./text-layer";
import Note from "./note-layer";
import Path from "./path-layer";
import { LayerType } from "@/types/canvas";
import { rgbToHex } from "@/lib/utils";

interface LayerPreviewProps {
	id: string;
	onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
	selectionColor?: string;
}

const LayerPreview = memo(
	({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
		const layer = useStorage((root) => root.layers.get(id));
		if (!layer) return null;

		switch (layer.type) {
			case LayerType.Text:
				return (
					<Text
						id={id}
						layer={layer}
						onLayerPointerDown={onLayerPointerDown}
						selectionColor={selectionColor}
					/>
				);
			case LayerType.Note:
				return (
					<Note
						id={id}
						layer={layer}
						onLayerPointerDown={onLayerPointerDown}
						selectionColor={selectionColor}
					/>
				);
			case LayerType.Rectangle:
				return (
					<Rectangle
						id={id}
						layer={layer}
						onLayerPointerDown={onLayerPointerDown}
						selectionColor={selectionColor}
					/>
				);
			case LayerType.Ellipse:
				return (
					<Ellipse
						id={id}
						layer={layer}
						onLayerPointerDown={onLayerPointerDown}
						selectionColor={selectionColor}
					/>
				);
			case LayerType.Path:
				return (
					<Path
						key={id}
						x={layer.x}
						y={layer.y}
						points={layer.points}
						fill={layer.fill ? rgbToHex(layer.fill) : "#000"}
						onPointerDown={(e) => onLayerPointerDown(e, id)}
						stroke={selectionColor}
					/>
				);
			default:
				console.warn("Unknown layer type");
				return null;
		}
	}
);
export default LayerPreview;
