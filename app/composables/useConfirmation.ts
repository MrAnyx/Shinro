import { LazyConfirmationModal } from "#components";

type ConfirmationOptions = {
	color?: AppColor;
};

export const useConfirmation = () => {
	const overlay = useOverlay();
	const confirmationModal = overlay.create(LazyConfirmationModal);

	const openConfirmationModal = async (callback: () => Promise<void> | void, opts?: ConfirmationOptions) => {
		const instance = confirmationModal.open({
			callback,
			color: opts?.color,
		});

		return await instance.result;
	};

	return {
		openConfirmationModal,
	};
};
