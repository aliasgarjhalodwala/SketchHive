import { Camera, Color, Point, Side, XYWH } from "@/types/canvas";
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
