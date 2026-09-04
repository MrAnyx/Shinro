<template>
	<UModal title="Confirmation" :dismissible="!isLoading" :close="!isLoading">
		<template #body>
			<p>Are you sure you want to confirm this action?</p>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton label="Confirm" :color="props.color ?? 'error'" @click="onConfirm" :loading="isLoading" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
	callback: () => Promise<void> | void;
	color?: AppColor;
}>();

const emit = defineEmits<{
	close: [value?: boolean];
}>();

const isLoading = ref(false);
const toast = useStatusToast();

const onCancel = () => {
	emit("close");
};

const onConfirm = async () => {
	try {
		isLoading.value = true;
		await props.callback();
		emit("close", true);
	} catch (err) {
		toast.error(err);
	} finally {
		isLoading.value = false;
	}
};
</script>
