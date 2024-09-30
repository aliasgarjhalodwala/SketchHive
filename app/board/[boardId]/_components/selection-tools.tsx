"use client";

import { memo } from "react";
import { useMutation, useSelf } from "@liveblocks/react/suspense";

import ColorPicker from "./color-picker";
import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Camera, Color } from "@/types/canvas";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";

interface SelectionToolsProps {
	camera: Camera;
	setLastUsedColor: (color: Color) => void;
}

const SelectionTools = memo(
	({ camera, setLastUsedColor }: SelectionToolsProps) => {
		const selection = useSelf((me) => me.presence.selection);

		const changeLayerLevel = useMutation(
			({ storage }, moveTo: string) => {
				const liveLayerIds = storage.get("layerIds");
				const indices: number[] = [];
				const arr = liveLayerIds.toImmutable();

				for (let i = 0; i < arr.length; i++) {
					if (selection.includes(arr[i])) {
						indices.push(i);
					}
				}

				for (let i = 0; i < indices.length; i++) {
					liveLayerIds.move(
						indices[i],
						moveTo === "front" ? arr.length - i - 1 : i
					);
				}
			},
			[selection]
		);

		const setFill = useMutation(
			({ storage }, fill: Color) => {
				const liveLayers = storage.get("layers");
				setLastUsedColor(fill);

				selection.forEach((id) =>
					liveLayers.get(id)?.set("fill", fill)
				);
			},
			[selection, setLastUsedColor]
		);

		const deleteLayers = useDeleteLayers();

		const selectionBounds = useSelectionBounds();
		if (!selectionBounds) return null;

		const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
		const y = selectionBounds.y + camera.y;

		return (
			<div
				className="absolute p-3 rounded-lg bg-white shadow-sm border flex select-none"
				style={{
					transform: `translate(calc(${x}px - 50%),calc(${y - 16}px - 100%))`,
				}}
			>
				<ColorPicker onChange={setFill} />

				<div className="flex flex-col gap-y-0.5">
					<Hint label="Bring to front">
						<Button
							variant="board"
							size="icon"
							onClick={() => changeLayerLevel("front")}
						>
							<BringToFront />
						</Button>
					</Hint>
					<Hint label="Send to back" side="bottom">
						<Button
							variant="board"
							size="icon"
							onClick={() => changeLayerLevel("back")}
						>
							<SendToBack />
						</Button>
					</Hint>
				</div>

				<div className="flex items-center pl-1.5 ml-1.5 border-l border-neutral-200">
					<Hint label="Delete">
						<Button
							variant="board"
							size="icon"
							onClick={deleteLayers}
						>
							<Trash2 />
						</Button>
					</Hint>
				</div>
			</div>
		);
	}
);

SelectionTools.displayName = "SelectionTools";

export default SelectionTools;
