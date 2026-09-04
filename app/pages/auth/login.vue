<template>
	<UAuthForm
		:schema="schema"
		title="Login"
		icon="i-lucide-user-check"
		:fields="fields"
		@submit="onSubmit"
		:loading="isLoading"
		:submit="{ label: 'Login' }"
		:validate-on="['change']"
	>
		<template #description>
			<div v-if="config.allowRegistration">
				Don't have an account?
				<ULink to="/auth/register" class="text-primary font-medium">Join the chaos</ULink>.
			</div>
			<div v-else>
				Don't have an account?
				<span class="text-gray-500">Tough luck. The VIP list is closed.</span>
			</div>
		</template>
		<template #footer> By continuing, you're choosing convenience over chaos. We respect that. </template>
	</UAuthForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { z } from "zod";

definePageMeta({
	layout: "auth",
	middleware: ["guest-only"],
});

const userStore = useUserStore();
const toast = useStatusToast();
const config = useClientConfig();

const isLoading = ref(false);

const fields: AuthFormField[] = [
	{
		label: "Username",
		name: "username",
		placeholder: "Enter your username",
		required: true,
		type: "text",
	},
	{
		label: "Password",
		name: "password",
		placeholder: "Enter your password",
		required: true,
		type: "password",
	},
];

const schema = z.object({
	username: ClientUserValidation.username,
	password: ClientUserValidation.password,
});

type Schema = z.output<typeof schema>;

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;
		await userStore.login(payload.data);
		await navigateTo({ path: "/app" });
	} catch (err) {
		toast.error(err);
	} finally {
		isLoading.value = false;
	}
};
</script>
