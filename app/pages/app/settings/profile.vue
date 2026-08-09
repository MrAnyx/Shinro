<template>
	<UCard>
		<template #title>
			<div class="flex items-center gap-x-2">
				<UIcon name="i-lucide-user" class="size-5" />
				<span>Account</span>
			</div>
		</template>
		<div class="flex flex-col gap-y-5">
			<UForm class="flex" :state="usernameState" :schema="usernameSchema">
				<div class="w-1/2 shrink-0">
					<h2 class="font-medium">Username</h2>
					<span class="text-sm text-muted">Choose the name you use to identify yourself across Shinro.</span>
				</div>
				<div class="flex-1 my-auto flex flex-col gap-y-3">
					<UFormField>
						<UInput class="w-full" :maxlength="255" placeholder="Username" icon="i-lucide-user" />
					</UFormField>

					<UButton
						label="Save changes"
						icon="i-lucide-save"
						class="self-end"
						variant="subtle"
						type="submit"
					/>
				</div>
			</UForm>

			<USeparator />

			<UForm class="flex">
				<div class="w-1/2 shrink-0">
					<h2 class="font-medium">Password</h2>
					<span class="text-sm text-muted">Update your password to keep your account secure.</span>
				</div>
				<div class="flex-1 my-auto flex flex-col gap-y-3">
					<UFormField>
						<UInput class="w-full" :maxlength="255" placeholder="Password" icon="i-lucide-lock" />
					</UFormField>

					<UFormField>
						<UInput
							class="w-full"
							:maxlength="255"
							placeholder="Password confirmation"
							icon="i-lucide-lock"
						/>
					</UFormField>

					<UButton label="Update password" icon="i-lucide-save" class="self-end" variant="subtle" />
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
import * as z from "zod";

const { openConfirmationModal } = useConfirmation();
const authStore = useAuthStore();

const usernameSchema = z.object({
	username: ClientUserValidation.username,
});

type UsernameSchema = z.output<typeof usernameSchema>;

const usernameState = reactive<UsernameSchema>({
	username: authStore.user?.username ?? "",
});

const deleteAccount = async () => {
	await openConfirmationModal(async () => await delay(4000));
	await navigateTo("/");
};
</script>
