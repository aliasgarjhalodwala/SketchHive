import { useMutation, useSelf } from "@liveblocks/react/suspense";

export const useDeleteLayers = () => {
	const selection = useSelf((me) => me.presence.selection);

	return useMutation(
		({ storage, setMyPresence }) => {
			const liveLayers = storage.get("layers");
			const liveLayerIds = storage.get("layerIds");

			for (const id of selection) {
				liveLayers.delete(id);

				const idx = liveLayerIds.indexOf(id);
				if (idx != -1) {
					liveLayerIds.delete(idx);
				}
			}

			setMyPresence({ selection: [] }, { addToHistory: true });
		},
		[selection]
	);
};
