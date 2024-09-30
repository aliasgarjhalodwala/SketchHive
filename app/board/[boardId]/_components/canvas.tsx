"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	useCanRedo,
	useCanUndo,
	useHistory,
	useMutation,
	useOthersMapped,
	useSelf,
	useStorage,
} from "@liveblocks/react/suspense";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";

import CursorsPresence from "./cursors-presence";
import Info from "./info";
import LayerPreview from "./layer-preview";
import Participants from "./participants";
import SelectionBox from "./selection-box";
import SelectionTools from "./selection-tools";
import Toolbar from "./toolbar";
import Path from "./path-layer";

import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { useDisableScrollBalance } from "@/hooks/use-disable-scroll-bounce";
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
	findLayersInSelectionNet,
	penPointsToPathLayer,
	pointerEventToCanvasPoint,
	resizeBounds,
	rgbToHex,
} from "@/lib/utils";

const MAX_LAYERS = 100;
const SELECTION_NET_THRESHOLD = 5;

interface CanvasProps {
	boardId: string;
}

const Canvas = ({ boardId }: CanvasProps) => {
	const layerIds = useStorage((root) => root.layerIds);
	const pencilDraft = useSelf((me) => me.presence.pencilDraft);

	const [canvasState, setCanvasState] = useState<CanvasState>({
		mode: CanvasMode.None,
	});
	const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
	const [lastUsedColor, setLastUsedColor] = useState<Color>({
		r: 220,
		g: 220,
		b: 220,
	});

	useDisableScrollBalance();
	const deleteLayers = useDeleteLayers();
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

	const translateLayers = useMutation(
		({ storage, self }, point: Point) => {
			if (canvasState.mode !== CanvasMode.Translating) return;

			const offset = {
				x: point.x - canvasState.current.x,
				y: point.y - canvasState.current.y,
			};

			const liveLayers = storage.get("layers");
			for (const id of self.presence.selection) {
				const layer = liveLayers.get(id);

				if (layer) {
					layer.update({
						x: layer.get("x") + offset.x,
						y: layer.get("y") + offset.y,
					});
				}
			}

			setCanvasState({ mode: CanvasMode.Translating, current: point });
		},
		[canvasState]
	);

	const unselectLayers = useMutation(({ self, setMyPresence }) => {
		if (self.presence.selection.length > 0) {
			setMyPresence({ selection: [] });
		}
	}, []);

	const startMultiSelection = useCallback((origin: Point, current: Point) => {
		if (
			Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) >
			SELECTION_NET_THRESHOLD
		) {
			setCanvasState({
				mode: CanvasMode.SelectionNet,
				origin,
				current,
			});
		}
	}, []);

	const updateSelectionNet = useMutation(
		({ storage, setMyPresence }, origin: Point, current: Point) => {
			const layers = storage.get("layers").toImmutable();
			setCanvasState({
				mode: CanvasMode.SelectionNet,
				origin,
				current,
			});

			const ids = findLayersInSelectionNet(
				layerIds,
				layers,
				origin,
				current
			);

			setMyPresence({ selection: ids });
		},
		[layerIds]
	);

	const selectAllLayers = useMutation(
		({ storage, setMyPresence }) => {
			const layerIds = storage.get("layerIds");
			setMyPresence({ selection: layerIds.toArray() });
		},
		[layerIds]
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

	const startDrawing = useMutation(
		({ setMyPresence }, point: Point, pressure: number) => {
			setMyPresence({
				pencilDraft: [[point.x, point.y, pressure]],
				pencilColor: lastUsedColor,
			});
		},
		[lastUsedColor]
	);

	const continueDrawing = useMutation(
		({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
			const { pencilDraft } = self.presence;
			if (
				canvasState.mode !== CanvasMode.Pencil ||
				e.buttons !== 1 ||
				pencilDraft == null
			) {
				return;
			}

			setMyPresence({
				cursor: point,
				pencilDraft:
					pencilDraft.length === 1 &&
					pencilDraft[0][0] === point.x &&
					pencilDraft[0][1] === point.y
						? pencilDraft
						: [...pencilDraft, [point.x, point.y, e.pressure]],
			});
		},
		[canvasState.mode]
	);

	const insertPath = useMutation(
		({ storage, self, setMyPresence }) => {
			const liveLayers = storage.get("layers");
			const { pencilDraft } = self.presence;

			if (
				pencilDraft == null ||
				pencilDraft.length < 2 ||
				liveLayers.size >= 100
			) {
				setMyPresence({ pencilDraft: null });
				return;
			}

			const id = nanoid();
			liveLayers.set(
				id,
				new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
			);

			const liveLayerIds = storage.get("layerIds");
			liveLayerIds.push(id);

			setMyPresence({ pencilDraft: null });
			setCanvasState({ mode: CanvasMode.Pencil });
		},
		[lastUsedColor]
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

			if (canvasState.mode === CanvasMode.Pressing) {
				startMultiSelection(canvasState.origin, current);
			} else if (canvasState.mode === CanvasMode.SelectionNet) {
				updateSelectionNet(canvasState.origin, current);
			} else if (canvasState.mode === CanvasMode.Translating) {
				translateLayers(current);
			} else if (canvasState.mode === CanvasMode.Resizing) {
				resizeLayer(current);
			} else if (canvasState.mode === CanvasMode.Pencil) {
				continueDrawing(current, e);
			}
			setMyPresence({ cursor: current });
		},
		[
			camera,
			canvasState,
			resizeLayer,
			translateLayers,
			continueDrawing,
			startMultiSelection,
			updateSelectionNet,
		]
	);

	const onPointerLeave = useMutation(({ setMyPresence }) => {
		setMyPresence({ cursor: null });
	}, []);

	const onPointerUp = useMutation(
		({}, e) => {
			const point = pointerEventToCanvasPoint(e, camera);

			if (
				canvasState.mode === CanvasMode.None ||
				canvasState.mode === CanvasMode.Pressing
			) {
				unselectLayers();
				setCanvasState({ mode: CanvasMode.None });
			} else if (canvasState.mode === CanvasMode.Pencil) {
				insertPath();
			} else if (canvasState.mode == CanvasMode.Inserting) {
				insertLayer(canvasState.layerType, point);
			} else {
				setCanvasState({
					mode: CanvasMode.None,
				});
			}

			history.resume();
		},
		[
			canvasState,
			setCanvasState,
			camera,
			history,
			insertLayer,
			unselectLayers,
			insertPath,
		]
	);

	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			const point = pointerEventToCanvasPoint(e, camera);

			if (canvasState.mode === CanvasMode.Inserting) return;

			if (canvasState.mode === CanvasMode.Pencil) {
				startDrawing(point, e.pressure);
				return;
			}

			setCanvasState({ mode: CanvasMode.Pressing, origin: point });
		},
		[camera, canvasState.mode, setCanvasState, startDrawing]
	);

	const onLayerPointerDown = useMutation(
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
				setMyPresence({ selection: [layerId] });
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

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			e.stopPropagation();

			if (e.key === "Backspace" || e.key === "Delete") {
				if (
					e.target instanceof HTMLElement &&
					!e.target.isContentEditable
				)
					deleteLayers();
			} else if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
				selectAllLayers();
			} else if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
				history.redo();
			} else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
				history.undo();
			}
		}

		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [history, deleteLayers, selectAllLayers]);

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
			<SelectionTools
				camera={camera}
				setLastUsedColor={setLastUsedColor}
			/>
			<svg
				className="h-full w-full"
				onWheel={onWheel}
				onPointerMove={onPointerMove}
				onPointerLeave={onPointerLeave}
				onPointerDown={onPointerDown}
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
							onLayerPointerDown={onLayerPointerDown}
							selectionColor={layerIdsToColorSelection[layerId]}
						/>
					))}
					<SelectionBox
						onResizeHandlePointerDown={onResizeHandlePointerDown}
					/>
					{canvasState.mode === CanvasMode.SelectionNet &&
						canvasState.current != null && (
							<rect
								className="fill-blue-500/5 stroke-blue-500 stroke-1"
								x={Math.min(
									canvasState.origin.x,
									canvasState.current.x
								)}
								y={Math.min(
									canvasState.origin.y,
									canvasState.current.y
								)}
								width={Math.abs(
									canvasState.current.x - canvasState.origin.x
								)}
								height={Math.abs(
									canvasState.current.y - canvasState.origin.y
								)}
							/>
						)}
					<CursorsPresence />
					{pencilDraft != null && pencilDraft.length > 0 && (
						<Path
							points={pencilDraft}
							fill={rgbToHex(lastUsedColor)}
							x={0}
							y={0}
						/>
					)}
				</g>
			</svg>
		</main>
	);
};
export default Canvas;
