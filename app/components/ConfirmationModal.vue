<template>
	<UModal title="Confirmation" :dismissible="!isLoading" :close="!isLoading">
		<template #body>
			<div class="flex flex-col gap-y-3">
				<p>Are you sure you want to confirm this action?</p>
				<UFormField v-if="needsPassword" :error="passwordError">
					<UInput
						v-model="password"
						type="password"
						placeholder="Enter your password"
						:disabled="isLoading"
						autofocus
						@keyup.enter="onConfirm"
						class="w-full"
					/>
				</UFormField>
			</div>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton label="Confirm" :color="props.color ?? 'error'" @click="onConfirm" :loading="isLoading" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
	callback?: () => Promise<void> | void;
	color?: AppColor;
	requirePassword?: boolean;
}>();

const emit = defineEmits<{
	close: [value?: boolean];
}>();

const isLoading = ref(false);
const toast = useStatusToast();
const trpc = useTrpc();
const password = ref("");
const passwordError = ref<string | undefined>();

const REVERIFY_WINDOW_MS = 15 * 60 * 1000;
const lastVerifiedAt = useState<number | null>("lastPasswordVerifiedAt", () => null);

const recentlyVerified = computed(() => {
	return !!lastVerifiedAt.value && Date.now() - lastVerifiedAt.value < REVERIFY_WINDOW_MS;
});

const needsPassword = computed(() => props.requirePassword && !recentlyVerified.value);

const onCancel = () => {
	emit("close");
};

const onConfirm = async () => {
	passwordError.value = undefined;

	if (needsPassword.value) {
		if (!password.value) {
			passwordError.value = "Password is required";
			return;
		}

		try {
			isLoading.value = true;
			const valid = await trpc.user.verifyPassword.mutate({ password: password.value });

			if (!valid) {
				passwordError.value = "Incorrect password";
				isLoading.value = false;
				return;
			}

			lastVerifiedAt.value = Date.now();
		} catch (err) {
			passwordError.value = "Incorrect password";
			isLoading.value = false;
			return;
		}
	}

	try {
		isLoading.value = true;
		await props.callback?.();
		emit("close", true);
	} catch (err) {
		toast.error(err);
	} finally {
		isLoading.value = false;
	}
};
</script>
