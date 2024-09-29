"use client";

import { useSelf, useStorage } from "@liveblocks/react/suspense";

import Handle from "./handle";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { LayerType, Side, XYWH } from "@/types/canvas";

interface SelectionBoxProps {
	onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
}

const SelectionBox = ({ onResizeHandlePointerDown }: SelectionBoxProps) => {
	const soleLayerId = useSelf((me) =>
		me.presence.selection.length === 1 ? me.presence.selection[0] : null
	);

	const isSelectedLayer = useStorage(
		(root) =>
			soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path
	);

	const bounds = useSelectionBounds();
	if (!bounds) return null;
	const { x, y, width, height } = bounds;

	return (
		<>
			<rect
				className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
				style={{
					transform: `translate(${x}px, ${y}px)`,
				}}
				x={0}
				y={0}
				width={width}
				height={height}
			/>
			{isSelectedLayer && (
				<>
					<Handle
						cursor="nwse-resize"
						x={x}
						y={y}
						onLayerPointerDown={(e) => {
							e.stopPropagation();
							onResizeHandlePointerDown(
								Side.Top + Side.Left,
								bounds
							);
						}}
					/>
					<Handle
						cursor="ns-resize"
						x={x + width / 2}
						y={y}
						onLayerPointerDown={(e) => {
							e.stopPropagation();
							onResizeHandlePointerDown(Side.Top, bounds);
						}}
					/>
					<Handle
						cursor="nesw-resize"
						x={x + width}
						y={y}
						onLayerPointerDown={(e) => {
							e.stopPropagation();
							onResizeHandlePointerDown(
								Side.Top + Side.Right,
								bounds
							);
						}}
					/>
					<Handle
						cursor="ew-resize"
						x={x + width}
						y={y + height / 2}
						onLayerPointerDown={(e) => {
							e.stopPropagation();
							onResizeHandlePointerDown(Side.Right, bounds);
						}}
					/>
					<Handle
						cursor="nwse-resize"
						x={x + width}
						y={y + height}
						onLayerPointerDown={(e) => {
							e.stopPropagation();
							onResizeHandlePointerDown(
								Side.Bottom + Side.Right,
								bounds
							);
						}}
					/>
					<Handle
						cursor="ns-resize"
						x={x + width / 2}
						y={y + height}
						onLayerPointerDown={(e) => {
							e.stopPropagation();
							onResizeHandlePointerDown(Side.Bottom, bounds);
						}}
					/>
					<Handle
						cursor="nesw-resize"
						x={x}
						y={y + height}
						onLayerPointerDown={(e) => {
							e.stopPropagation();
							onResizeHandlePointerDown(
								Side.Bottom + Side.Left,
								bounds
							);
						}}
					/>
					<Handle
						cursor="ew-resize"
						x={x}
						y={y + height / 2}
						onLayerPointerDown={(e) => {
							e.stopPropagation();
							onResizeHandlePointerDown(Side.Left, bounds);
						}}
					/>
				</>
			)}
		</>
	);
};

export default SelectionBox;
