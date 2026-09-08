<template>
	<UModal title="Confirmation" :dismissible="!isLoading" :close="!isLoading">
		<template #body>
			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				:validate-on="['change']"
				class="flex flex-col gap-y-3"
				@submit="onSubmit"
			>
				<p>{{ props.message ?? "Are you sure you want to confirm this action?" }}</p>

				<UFormField v-if="needsPassword" name="password">
					<UInput
						v-model="state.password"
						type="password"
						placeholder="Enter your password"
						:disabled="isLoading"
						autofocus
						:color="props.color ?? 'error'"
						class="w-full"
					/>
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" :disabled="isLoading" @click="onCancel" />
			<UButton label="Confirm" :color="props.color ?? 'error'" :loading="isLoading" @click="onConfirm" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const props = defineProps<{
	callback?: () => Promise<void> | void;
	color?: AppColor;
	requirePassword?: boolean;
	message?: string;
}>();

const emit = defineEmits<{
	close: [value?: boolean];
}>();

const isLoading = ref(false);
const toast = useStatusToast();
const trpc = useTrpc();
const form = useTemplateRef("form");

const REVERIFY_WINDOW_MS = 15 * 60 * 1000;
const lastVerifiedAt = useState<number | null>("confirmation:lastPasswordVerifiedAt", () => null);

const recentlyVerified = computed(() => {
	return !!lastVerifiedAt.value && Date.now() - lastVerifiedAt.value < REVERIFY_WINDOW_MS;
});

const needsPassword = computed(() => !!props.requirePassword && !recentlyVerified.value);

// Schema is reactive: only require the password field when it's actually needed
const schema = computed(() =>
	needsPassword.value
		? z.object({ password: ClientUserValidation.password })
		: z.object({ password: z.string().optional() }),
);
type Schema = z.infer<typeof schema.value>;

const state = reactive<Schema>({
	password: "",
});

const onCancel = () => {
	emit("close");
};

const onConfirm = () => {
	form.value?.submit();
};

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;

		if (needsPassword.value) {
			const valid = await trpc.user.verifyPassword.mutate({ password: payload.data.password! });

			if (!valid) {
				form.value?.setErrors([{ name: "password", message: "Incorrect password" }]);
				return;
			}

			lastVerifiedAt.value = Date.now();
		}

		await props.callback?.();
		emit("close", true);
	} catch (err) {
		toast.error(err);
	} finally {
		isLoading.value = false;
	}
};
</script>
