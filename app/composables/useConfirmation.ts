import { LazyConfirmationModal } from "#components";

export const useConfirmation = () => {
	const overlay = useOverlay();
	const confirmationModal = overlay.create(LazyConfirmationModal);

	const openConfirmationModal = async (callback: () => Promise<void> | void) => {
		const instance = confirmationModal.open({
			callback,
		});

		return await instance.result;
	};

	return {
		openConfirmationModal,
	};
};
