"use client";

import { memo, useEffect } from "react";
import { useStorage } from "@liveblocks/react/suspense";

import Rectangle from "./rectangle";
import { LayerType } from "@/types/canvas";

interface LayerPreviewProps {
	id: string;
	onPointerDown: (e: React.PointerEvent, layerId: string) => void;
	selectionColor?: string;
}

const LayerPreview = memo(
	({ id, onPointerDown, selectionColor }: LayerPreviewProps) => {
		const layer = useStorage((root) => root.layers.get(id));
		if (!layer) return null;

		switch (layer.type) {
			case LayerType.Rectangle:
				return (
					<Rectangle
						id={id}
						layer={layer}
						onPointerDown={onPointerDown}
						selectionColor={selectionColor}
					/>
				);
			default:
				console.warn("Unknown layer type");
				return null;
		}
	}
);
export default LayerPreview;
