import {
	Camera,
	Color,
	Layer,
	LayerType,
	PathLayer,
	Point,
	Side,
	XYWH,
} from "@/types/canvas";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const connIdToColor = (connId: number): string => {
	return COLORS[connId % COLORS.length];
};

export const pointerEventToCanvasPoint = (
	e: React.PointerEvent,
	camera: Camera
) => {
	return {
		x: Math.round(e.clientX - camera.x),
		y: Math.round(e.clientY - camera.y),
	};
};

export const rgbToHex = (color: Color) => {
	return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
};

export const resizeBounds = (
	bounds: XYWH,
	corner: Side,
	point: Point
): XYWH => {
	const result = { ...bounds };

	if ((corner & Side.Left) === Side.Left) {
		result.x = Math.min(point.x, bounds.x + bounds.width);
		result.width = Math.abs(bounds.x + bounds.width - point.x);
	}

	if ((corner & Side.Right) === Side.Right) {
		result.width = Math.abs(point.x - bounds.x);
	}

	if ((corner & Side.Top) === Side.Top) {
		result.y = Math.min(point.y, bounds.y + bounds.height);
		result.height = Math.abs(bounds.height + bounds.y - point.y);
	}

	if ((corner & Side.Bottom) === Side.Bottom) {
		result.height = Math.abs(point.y - bounds.y);
	}

	return result;
};

export const findLayersInSelectionNet = (
	layerIds: readonly string[],
	layers: ReadonlyMap<string, Layer>,
	origin: Point,
	current: Point
) => {
	const rect = {
		x: Math.min(origin.x, current.x),
		y: Math.min(origin.y, current.y),
		width: Math.abs(origin.x - current.x),
		height: Math.abs(origin.y - current.y),
	};

	const ids = [];

	for (const layerId of layerIds) {
		const layer = layers.get(layerId);
		if (layer == null) continue;

		const { x, y, height, width } = layer;

		if (
			rect.x + rect.width > x &&
			rect.x < x + width &&
			rect.y + rect.height > y &&
			rect.y < y + height
		) {
			ids.push(layerId);
		}
	}

	return ids;
};

export const getContrastColor = (color: Color) => {
	const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

	return luminance > 182 ? "black" : "white";
};

export const penPointsToPathLayer = (
	points: number[][],
	color: Color
): PathLayer => {
	if (points.length < 2) {
		throw new Error("Cannot transform points with less than 2 points");
	}

	let left = Number.POSITIVE_INFINITY;
	let top = Number.POSITIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;

	for (const point of points) {
		const [x, y] = point;

		if (left > x) {
			left = x;
		}

		if (top > y) {
			top = y;
		}

		if (right < x) {
			right = x;
		}

		if (bottom < y) {
			bottom = y;
		}
	}

	return {
		type: LayerType.Path,
		x: left,
		y: top,
		height: bottom - top,
		width: right - left,
		fill: color,
		points: points.map(([x, y, pressure]) => [x - left, y - top, pressure]),
	};
};

export const getSvgPathFromStroke = (stroke: number[][]) => {
	if (!stroke.length) return "";

	const d = stroke.reduce(
		(acc, [x0, y0], i, arr) => {
			const [x1, y1] = arr[(i + 1) % arr.length];
			acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
			return acc;
		},
		["M", ...stroke[0], "Q"]
	);

	d.push("Z");
	return d.join(" ");
};
