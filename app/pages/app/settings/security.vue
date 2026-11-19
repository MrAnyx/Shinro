<template>
	<ColorCard title="Password" icon="i-lucide-lock">
		<div class="flex flex-col gap-y-5">
			<SettingsParameterItem
				title="Password"
				description="Update your password to keep your account secure. Other devices will be signed out."
			>
				<UForm
					ref="passwordForm"
					class="flex-1 my-auto flex flex-col gap-y-3"
					:state="passwordState"
					:schema="passwordSchema"
					@submit="onSavePassword"
					:validate-on="['change']"
				>
					<UFormField name="current_password">
						<UInput
							v-model="passwordState.current_password"
							class="w-full"
							placeholder="Current password"
							icon="i-lucide-lock-keyhole"
							type="password"
							autocomplete="current-password"
						/>
					</UFormField>

					<UFormField name="password">
						<UInput
							v-model="passwordState.password"
							class="w-full"
							placeholder="New password"
							icon="i-lucide-lock"
							type="password"
							autocomplete="new-password"
						/>
					</UFormField>

					<UFormField name="password_confirmation">
						<UInput
							v-model="passwordState.password_confirmation"
							class="w-full"
							placeholder="New password confirmation"
							icon="i-lucide-lock"
							type="password"
							autocomplete="new-password"
						/>
					</UFormField>

					<UButton
						label="Update password"
						icon="i-lucide-save"
						class="self-end"
						variant="subtle"
						type="submit"
						:loading="isLoadingPassword"
					/>
				</UForm>
			</SettingsParameterItem>
		</div>
	</ColorCard>

	<ColorCard title="Sessions" icon="i-lucide-monitor-smartphone">
		<div class="flex flex-col gap-y-5">
			<SettingsParameterItem
				title="Other devices"
				description="Sign out every other browser and device using your account. This device stays signed in. Changing your username or password does this automatically."
			>
				<UButton
					label="Log out other devices"
					icon="i-lucide-log-out"
					class="self-end"
					variant="subtle"
					color="warning"
					:loading="isLoadingLogoutOthers"
					@click="logoutOthers"
				/>
			</SettingsParameterItem>
		</div>
	</ColorCard>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const { openConfirmationModal } = useConfirmation();
const userStore = useUserStore();
const toast = useStatusToast();

// Password
const isLoadingPassword = ref(false);
const passwordForm = useTemplateRef("passwordForm");

const passwordSchema = z
	.object({
		current_password: ClientUserValidation.password,
		password: ClientUserValidation.password,
		password_confirmation: ClientUserValidation.password,
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords must match",
		path: ["password_confirmation"],
	});

type PasswordSchema = z.output<typeof passwordSchema>;

const passwordState = reactive<PasswordSchema>({
	current_password: "",
	password: "",
	password_confirmation: "",
});

const onSavePassword = async (payload: FormSubmitEvent<PasswordSchema>) => {
	try {
		isLoadingPassword.value = true;

		await userStore.updateMe({
			password: payload.data.password,
			currentPassword: payload.data.current_password,
		});

		passwordState.current_password = "";
		passwordState.password = "";
		passwordState.password_confirmation = "";

		toast.success({ description: `Password has been updated` });
	} catch (err) {
		if (getTRPCErrorCode(err) === "FORBIDDEN") {
			passwordForm.value?.setErrors([{ name: "current_password", message: "Incorrect password" }]);
			return;
		}

		toast.error(err);
	} finally {
		isLoadingPassword.value = false;
	}
};

// Sessions
const _logoutOthers = async () => {
	let count = 0;

	const result = await openConfirmationModal(
		async () => {
			({ count } = await userStore.logoutOthers());
		},
		{
			title: "Log out other devices",
			icon: "i-lucide-log-out",
			confirmLabel: "Log out other devices",
			confirmIcon: "i-lucide-log-out",
			message: "Every other browser and device signed in to your account will have to sign in again.",
		},
	);

	if (result) {
		toast.success({
			description: `${count} other ${count === 1 ? "session has" : "sessions have"} been signed out`,
		});
	}
};

const { loading: isLoadingLogoutOthers, execute: logoutOthers } = useLoadingWrapper(_logoutOthers);
</script>
