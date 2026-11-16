<template>
	<ColorCard
		v-if="userStore.isUser && adminSetup?.pending"
		title="Administrator setup"
		icon="i-lucide-shield-check"
		color="primary"
		variant="subtle"
	>
		<SettingsParameterItem
			title="Become administrator"
			description="This instance has no administrator yet. Enter the one-time setup token printed in the server logs to promote your account. The token expires, restart the server to get a new one."
		>
			<UForm
				class="flex-1 my-auto flex flex-col gap-y-3"
				:state="adminSetupState"
				:schema="adminSetupSchema"
				@submit="onClaimAdmin"
				:validate-on="['change']"
			>
				<UFormField name="token">
					<UInput
						v-model="adminSetupState.token"
						class="w-full"
						:maxlength="USER_ADMIN_SETUP_TOKEN_MAX_LENGTH"
						placeholder="Setup token"
						icon="i-lucide-key-round"
						type="password"
						autocomplete="off"
					/>
				</UFormField>

				<UButton
					label="Become administrator"
					icon="i-lucide-shield-check"
					class="self-end"
					variant="subtle"
					type="submit"
					:loading="isLoadingAdminSetup"
				/>
			</UForm>
		</SettingsParameterItem>
	</ColorCard>

	<ColorCard title="Account" icon="i-lucide-user">
		<div class="flex flex-col gap-y-5">
			<SettingsParameterItem
				title="Username"
				description="Choose the name you use to identify yourself across Shinro."
			>
				<UForm
					class="flex-1 my-auto flex flex-col gap-y-3"
					:state="usernameState"
					:schema="usernameSchema"
					@submit="onSaveUsername"
					:validate-on="['change']"
				>
					<UFormField name="username">
						<UInput
							v-model="usernameState.username"
							class="w-full"
							:maxlength="USER_USERNAME_MAX_LENGTH"
							placeholder="Username"
							icon="i-lucide-user"
						/>
					</UFormField>

					<UButton
						label="Save changes"
						icon="i-lucide-save"
						class="self-end"
						variant="subtle"
						type="submit"
						:loading="isLoadingUsername"
					/>
				</UForm>
			</SettingsParameterItem>
		</div>
	</ColorCard>

	<ColorCard title="Danger zone" icon="i-lucide-triangle-alert" color="error" variant="subtle">
		<div class="flex flex-col gap-y-5">
			<SettingsParameterItem
				title="Delete my account"
				description="Permanently erase your account, collections, saved media, and all other associated data. This action cannot be undone."
			>
				<UButton
					label="Delete my account"
					icon="i-lucide-trash"
					class="self-end"
					color="error"
					variant="subtle"
					:loading="isLoadingDeleteAccount"
					@click="deleteAccount"
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
const trpc = useTrpc();

// Administrator setup
const { data: adminSetup, refresh: refreshAdminSetup } = useClientAsyncData(async () =>
	userStore.isUser ? await trpc.user.adminSetupStatus.query() : { pending: false },
);

const isLoadingAdminSetup = ref(false);

const adminSetupSchema = z.object({
	token: ClientUserValidation.adminSetupToken,
});

type AdminSetupSchema = z.output<typeof adminSetupSchema>;

const adminSetupState = reactive<AdminSetupSchema>({
	token: "",
});

const onClaimAdmin = async (payload: FormSubmitEvent<AdminSetupSchema>) => {
	try {
		isLoadingAdminSetup.value = true;

		await userStore.claimAdmin(payload.data);
		adminSetupState.token = "";

		toast.success({ description: "Your account is now an administrator" });
	} catch (err) {
		toast.error(err);
		await refreshAdminSetup();
	} finally {
		isLoadingAdminSetup.value = false;
	}
};

// Username
const isLoadingUsername = ref(false);

const usernameSchema = z.object({
	username: ClientUserValidation.username,
});

type UsernameSchema = z.output<typeof usernameSchema>;

const usernameState = reactive<UsernameSchema>({
	username: userStore.user?.username ?? "",
});

const onSaveUsername = async (payload: FormSubmitEvent<UsernameSchema>) => {
	try {
		isLoadingUsername.value = true;

		await userStore.updateMe(payload.data);
		toast.success({ description: `Username has been updated` });
	} catch (err) {
		toast.error(err);
	} finally {
		isLoadingUsername.value = false;
	}
};

const _deleteAccount = async () => {
	const result = await openConfirmationModal(() => userStore.deleteMe(), {
		requirePassword: true,
		title: "Permanently delete my account",
		icon: "i-lucide-user-x",
		confirmLabel: "Delete my account",
		confirmIcon: "i-lucide-trash",
		message:
			"This will permanently delete your account, including all collections, saved media, and related data. This action cannot be undone. Please confirm your password to continue.",
	});

	if (result) {
		toast.success({ description: "Your account has been deleted" });
		await navigateTo("/");
	}
};

const { loading: isLoadingDeleteAccount, execute: deleteAccount } = useLoadingWrapper(_deleteAccount);
</script>
