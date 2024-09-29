"use client";

import { colors } from "@/constants/picker-colors";
import { Color } from "@/types/canvas";
import { rgbToHex } from "@/lib/utils";

interface ColorPickerProps {
	onChange: (color: Color) => void;
}

const ColorPicker = ({ onChange }: ColorPickerProps) => {
	return (
		<div className="flex items-center flex-wrap gap-1.5 max-w-40 pr-1.5 mr-1.5 border-r border-neutral-200">
			{colors.map((color, idx) => (
				<ColorButton onClick={onChange} color={color} key={idx} />
			))}
		</div>
	);
};

interface ColorButtonProps {
	onClick: (color: Color) => void;
	color: Color;
}

const ColorButton = ({ onClick, color }: ColorButtonProps) => {
	return (
		<button
			className="w-8 h-8 flex items-center justify-center hover:opacity-75 transition"
			onClick={() => onClick(color)}
		>
			<div
				className="w-8 h-8 rounded-md border border-neutral-300"
				style={{ background: rgbToHex(color) }}
			/>
		</button>
	);
};

export default ColorPicker;
