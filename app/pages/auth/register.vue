<template>
	<UAuthForm
		:schema="schema"
		title="Register"
		icon="i-lucide-user-plus"
		:fields="fields"
		@submit="onSubmit"
		:loading="authStore.isLoading"
		:submit="{ label: 'Register' }"
		:validate-on="['change']"
	>
		<template #description>
			Already have an acount?
			<ULink to="/auth/login" class="text-primary font-medium">Sign in</ULink>.
		</template>
		<template #footer>
			By signing up, you agree to our
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
	middleware: ["registration", "guest-only"],
});

const toast = useToast();
const authStore = useAuthStore();

const fields: AuthFormField[] = [
	{
		label: "Username",
		name: "username",
		placeholder: "Enter your username",
		required: true,
		leadingIcon: "i-lucide-user",
		type: "text",
		maxlength: 255,
	},
	{
		label: "Password",
		name: "password",
		placeholder: "Enter your password",
		required: true,
		leadingIcon: "i-lucide-lock",
		type: "password",
	},
	{
		label: "Password confirmation",
		name: "password_confirmation",
		placeholder: "Confirm your password",
		required: true,
		leadingIcon: "i-lucide-lock",
		type: "password",
	},
];

const schema = z
	.object({
		username: UserValidation.username,
		password: UserValidation.password,
		password_confirmation: UserValidation.password,
	})
	.refine((data) => data.password === data.password_confirmation, { message: "Passwords must match", path: ["password_confirmation"] });

type Schema = z.output<typeof schema>;

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		await authStore.register(payload.data);
		await navigateTo({ path: "/app" });
	} catch (err) {
		const message = isTRPCError(err) ? err.message : "Unknown error";

		toast.add({
			title: "Registration failed",
			description: message,
			color: "error",
			type: "foreground",
		});
	}
};
</script>
