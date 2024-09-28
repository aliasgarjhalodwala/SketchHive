import { useMutation } from "convex/react";
import { useState } from "react";

export const useApiMutation = (mutationFunction: any) => {
	const [isPending, setIsPending] = useState(false);
	const apiMutation = useMutation(mutationFunction);

	const mutate = async (payload: Object) => {
		setIsPending(true);
		try {
			const result = await apiMutation(payload);
			return result;
		} catch (error) {
			throw error;
		} finally {
			setIsPending(false);
		}
	};

	return { mutate, isPending };
};
