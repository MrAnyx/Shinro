<template>
	<UAuthForm
		:schema="schema"
		title="Login"
		icon="i-lucide-user-check"
		:fields="fields"
		@submit="onSubmit"
		:loading="authStore.isLoading"
		:submit="{ label: 'Login' }"
		:validate-on="['change']"
	>
		<template #description>
			Don't have an account?
			<ULink to="/auth/register" class="text-primary font-medium">Sign up</ULink>.
		</template>
		<template #footer>
			By signing in, you agree to our
			<ULink to="/" class="text-primary font-medium">Terms of Service</ULink>.
		</template>
	</UAuthForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { isTRPCClientError } from "@trpc/client";
import * as z from "zod";

definePageMeta({
	layout: "auth",
	middleware: ["guest-only"],
});

const authStore = useAuthStore();
const toast = useToast();

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
	username: UserSchema.validation.username,
	password: UserSchema.validation.password,
});

type Schema = z.output<typeof schema>;

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		await authStore.login(payload.data);
		await navigateTo({ path: "/app" });
	} catch (err) {
		const message = isTRPCError(err) ? err.message : "Unknown error";

		toast.add({
			title: "Authentication failed",
			description: message,
			color: "error",
			type: "foreground",
		});
	}
};
</script>
