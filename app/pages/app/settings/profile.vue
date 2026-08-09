<template>
	<UCard>
		<template #title>
			<div class="flex items-center gap-x-2">
				<UIcon name="i-lucide-user" class="size-5" />
				<span>Account</span>
			</div>
		</template>
		<div class="flex flex-col gap-y-5">
			<UForm
				class="flex"
				:state="usernameState"
				:schema="usernameSchema"
				@submit="onSaveUsername"
				:validate-on="['change']"
			>
				<div class="w-1/2 shrink-0">
					<h2 class="font-medium">Username</h2>
					<span class="text-sm text-muted">Choose the name you use to identify yourself across Shinro.</span>
				</div>
				<div class="flex-1 my-auto flex flex-col gap-y-3">
					<UFormField name="username">
						<UInput
							v-model="usernameState.username"
							class="w-full"
							:maxlength="255"
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
				</div>
			</UForm>

			<USeparator />

			<UForm
				class="flex"
				:state="passwordState"
				:schema="passwordSchema"
				@submit="onSavePassword"
				:validate-on="['change']"
			>
				<div class="w-1/2 shrink-0">
					<h2 class="font-medium">Password</h2>
					<span class="text-sm text-muted">Update your password to keep your account secure.</span>
				</div>
				<div class="flex-1 my-auto flex flex-col gap-y-3">
					<UFormField name="password">
						<UInput
							v-model="passwordState.password"
							class="w-full"
							placeholder="Password"
							icon="i-lucide-lock"
							type="password"
						/>
					</UFormField>

					<UFormField name="password_confirmation">
						<UInput
							v-model="passwordState.password_confirmation"
							class="w-full"
							placeholder="Password confirmation"
							icon="i-lucide-lock"
							type="password"
						/>
					</UFormField>

					<UButton
						label="Update password"
						icon="i-lucide-save"
						class="self-end"
						variant="subtle"
						type="submit"
					/>
				</div>
			</UForm>
		</div>
	</UCard>

	<UCard :ui="{ root: 'ring ring-error/50', header: 'bg-error/5' }">
		<template #title>
			<div class="flex items-center gap-x-2 text-error">
				<UIcon name="i-lucide-triangle-alert" class="size-5" />
				<span>Danger zone</span>
			</div>
		</template>
		<div class="flex flex-col gap-y-5">
			<div class="flex">
				<div class="w-1/2 shrink-0">
					<h2 class="font-medium">Delete my account</h2>
					<span class="text-sm text-muted"
						>Permanently erase your account, collections, saved media, and all other associated data. This
						action cannot be undone.</span
					>
				</div>
				<div class="flex-1 my-auto flex flex-col gap-y-3">
					<UButton
						label="Delete my account"
						icon="i-lucide-trash"
						class="self-end"
						color="error"
						variant="subtle"
						@click="deleteAccount"
					/>
				</div>
			</div>
		</div>
	</UCard>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const { openConfirmationModal } = useConfirmation();
const userStore = useUserStore();
const toast = useToast();
const trpc = useTrpc();

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
		toast.add({
			title: "Profile updated",
			description: `Your username has been updated`,
			color: "success",
			type: "foreground",
		});
	} catch (err) {
		const message = isTRPCError(err) ? err.message : "Unknown error";

		toast.add({
			title: "Request failed",
			description: message,
			color: "error",
			type: "foreground",
		});
	} finally {
		isLoadingUsername.value = false;
	}
};

// Password
const isLoadingPassword = ref(false);

const passwordSchema = z
	.object({
		password: ClientUserValidation.password,
		password_confirmation: ClientUserValidation.password,
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords must match",
		path: ["password_confirmation"],
	});

type PasswordSchema = z.output<typeof passwordSchema>;

const passwordState = reactive<PasswordSchema>({
	password: "",
	password_confirmation: "",
});

const onSavePassword = async (payload: FormSubmitEvent<PasswordSchema>) => {
	try {
		isLoadingPassword.value = true;

		await trpc.user.updateMe.mutate({
			password: payload.data.password,
		});
		toast.add({
			title: "Profile updated",
			description: `Your password has been updated`,
			color: "success",
			type: "foreground",
		});
	} catch (err) {
		const message = isTRPCError(err) ? err.message : "Unknown error";

		toast.add({
			title: "Request failed",
			description: message,
			color: "error",
			type: "foreground",
		});
	} finally {
		isLoadingPassword.value = false;
	}
};

const deleteAccount = async () => {
	const result = await openConfirmationModal(async () => await userStore.deleteMe());

	if (result) {
		await navigateTo("/");
	}
};
</script>
