import { LazyConfirmationModal } from "#components";

export const useConfirmation = () => {
	const overlay = useOverlay();
	const confirmationModal = overlay.create(LazyConfirmationModal);

	const openConfirmationModal = async (
		callback: () => Promise<void> | void,
		opts?: InstanceType<typeof LazyConfirmationModal>["$props"],
	) => {
		const instance = confirmationModal.open({
			callback,
			...opts,
		});

		return await instance.result;
	};

	return {
		openConfirmationModal,
	};
};
