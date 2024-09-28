"use client";

const HANDLE_SIZE = 8;
const HANDLE_OFFSET = HANDLE_SIZE / 2;

interface HandleProps {
	cursor: string;
	x: number;
	y: number;
	onPointerDown: (e: React.PointerEvent) => void;
}

const Handle = ({ cursor, x, y, onPointerDown }: HandleProps) => {
	return (
		<rect
			className="fill-white stroke-1 stroke-blue-500"
			x={0}
			y={0}
			style={{
				cursor,
				width: `${HANDLE_SIZE}px`,
				height: `${HANDLE_SIZE}px`,
				transform: `translate(${x - HANDLE_OFFSET}px, ${y - HANDLE_OFFSET}px)`,
			}}
			onPointerDown={onPointerDown}
		/>
	);
};

export default Handle;
