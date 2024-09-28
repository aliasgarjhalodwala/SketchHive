"use client";

import { memo, useCallback, useMemo, useState } from "react";
import {
	useCanRedo,
	useCanUndo,
	useHistory,
	useMutation,
	useOthersMapped,
	useStorage,
} from "@liveblocks/react/suspense";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";

import CursorsPresence from "./cursors-presence";
import Info from "./info";
import LayerPreview from "./layer-preview";
import Participants from "./participants";
import SelectionBox from "./selection-box";
import Toolbar from "./toolbar";

import {
	Camera,
	CanvasMode,
	CanvasState,
	Color,
	LayerType,
	Point,
	Side,
	XYWH,
} from "@/types/canvas";
import {
	connIdToColor,
	pointerEventToCanvasPoint,
	resizeBounds,
} from "@/lib/utils";

const MAX_LAYERS = 100;

interface CanvasProps {
	boardId: string;
}

const Canvas = ({ boardId }: CanvasProps) => {
	const layerIds = useStorage((root) => root.layerIds);

	const [canvasState, setCanvasState] = useState<CanvasState>({
		mode: CanvasMode.None,
	});
	const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
	const [lastUsedColor, setLastUsedColor] = useState<Color>({
		r: 120,
		g: 247,
		b: 255,
	});

	const history = useHistory();
	const canUndo = useCanUndo();
	const canRedo = useCanRedo();

	const insertLayer = useMutation(
		(
			{ storage, setMyPresence },
			layerType:
				| LayerType.Ellipse
				| LayerType.Rectangle
				| LayerType.Text
				| LayerType.Note,
			position: Point
		) => {
			const liveLayers = storage.get("layers");
			if (liveLayers.size >= MAX_LAYERS) return;

			const liveLayerIds = storage.get("layerIds");
			const layerId = nanoid();
			const layer = new LiveObject({
				type: layerType,
				x: position.x,
				y: position.y,
				height: 100,
				width: 100,
				fill: lastUsedColor,
			});

			liveLayerIds.push(layerId);
			liveLayers.set(layerId, layer);

			setMyPresence({ selection: [layerId] }, { addToHistory: true });
			setCanvasState({ mode: CanvasMode.None });
		},
		[lastUsedColor]
	);

	const resizeLayer = useMutation(
		({ storage, self }, point: Point) => {
			if (canvasState.mode !== CanvasMode.Resizing) return;

			const bounds = resizeBounds(
				canvasState.initialBounds,
				canvasState.corner,
				point
			);

			const liveLayers = storage.get("layers");
			const layer = liveLayers.get(self.presence.selection[0]);

			if (layer) {
				layer.update(bounds);
			}
		},
		[canvasState]
	);

	const onResizeHandlePointerDown = useCallback(
		(corner: Side, initialBounds: XYWH) => {
			history.pause();
			setCanvasState({
				mode: CanvasMode.Resizing,
				initialBounds,
				corner,
			});
		},
		[history]
	);

	const onWheel = useCallback((e: React.WheelEvent) => {
		setCamera((camera) => ({
			x: camera.x - e.deltaX,
			y: camera.y - e.deltaY,
		}));
	}, []);

	const onPointerMove = useMutation(
		({ setMyPresence }, e: React.PointerEvent) => {
			e.preventDefault();

			const current = pointerEventToCanvasPoint(e, camera);

			if (canvasState.mode === CanvasMode.Resizing) {
				resizeLayer(current);
			}
			setMyPresence({ cursor: current });
		},
		[camera, canvasState, resizeLayer]
	);

	const onPointerLeave = useMutation(({ setMyPresence }) => {
		setMyPresence({ cursor: null });
	}, []);

	const onPointerUp = useMutation(
		({}, e) => {
			const point = pointerEventToCanvasPoint(e, camera);

			if (canvasState.mode == CanvasMode.Inserting) {
				insertLayer(canvasState.layerType, point);
			} else {
				setCanvasState({
					mode: CanvasMode.None,
				});
			}

			history.resume();
		},
		[canvasState, camera, history, insertLayer]
	);

	const onPointerDown = useMutation(
		({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
			if (
				canvasState.mode === CanvasMode.Inserting ||
				canvasState.mode === CanvasMode.Pencil
			) {
				return;
			}

			history.pause();
			e.stopPropagation();

			const point = pointerEventToCanvasPoint(e, camera);

			if (!self.presence.selection.includes(layerId)) {
				setMyPresence({ selection: [layerId] }, { addToHistory: true });
			}
			setCanvasState({ mode: CanvasMode.Translating, current: point });
		},
		[setCanvasState, camera, history, canvasState.mode]
	);

	const selections = useOthersMapped((other) => other.presence.selection);

	const layerIdsToColorSelection = useMemo(() => {
		const layerIdsToColorSelection: Record<string, string> = {};

		for (const user of selections) {
			const [connectionId, selection] = user;

			for (const layerId of selection) {
				layerIdsToColorSelection[layerId] = connIdToColor(connectionId);
			}
		}

		return layerIdsToColorSelection;
	}, [selections]);

	return (
		<main className="h-full w-full relative bg-neutral-100 touch-none">
			<Info boardId={boardId} />
			<Participants />
			<Toolbar
				canvasState={canvasState}
				setCanvasState={setCanvasState}
				undo={history.undo}
				redo={history.redo}
				canUndo={canUndo}
				canRedo={canRedo}
			/>
			<svg
				className="h-screen w-screen"
				onWheel={onWheel}
				onPointerMove={onPointerMove}
				onPointerLeave={onPointerLeave}
				onPointerUp={onPointerUp}
			>
				<g
					style={{
						transform: `translate(${camera.x}px, ${camera.y}px)`,
					}}
				>
					{layerIds.map((layerId) => (
						<LayerPreview
							key={layerId}
							id={layerId}
							onPointerDown={onPointerDown}
							selectionColor={layerIdsToColorSelection[layerId]}
						/>
					))}
					<SelectionBox
						onResizeHandlePointerDown={onResizeHandlePointerDown}
					/>
					<CursorsPresence />
				</g>
			</svg>
		</main>
	);
};
export default Canvas;
