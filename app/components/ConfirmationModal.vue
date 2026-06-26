<template>
	<UModal title="Confirmation" :dismissible="!isLoading" :close="!isLoading">
		<template #body>
			<p>Are you sure you want to confirm this action?</p>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton label="Confirm" color="error" @click="onConfirm" :loading="isLoading" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
const { callback } = defineProps<{ callback: () => Promise<void> | void }>();

const emit = defineEmits<{
	close: [value?: boolean];
}>();

const isLoading = ref(false);
const toast = useToast();

const onCancel = () => {
	emit("close");
};

const onConfirm = async () => {
	try {
		isLoading.value = true;
		await callback();
		emit("close", true);
	} catch (err) {
		const message = isTRPCError(err) ? err.message : "Unknown error";

		toast.add({
			title: "Confirmation failed",
			description: message,
			color: "error",
			type: "foreground",
		});
	} finally {
		isLoading.value = false;
	}
};
</script>
