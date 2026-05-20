<template>
	<UAuthForm :schema="schema" title="Login" icon="i-lucide-user" :fields="fields" @submit="onSubmit" :submit="{ label: 'Login' }">
		<template #description>
			Don't have an account?
			<ULink to="/" class="text-primary font-medium">Sign up</ULink>.
		</template>
		<template #password-hint>
			<ULink to="#" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
		</template>
		<template #footer>
			By signing in, you agree to our
			<ULink to="/" class="text-primary font-medium">Terms of Service</ULink>.
		</template>
	</UAuthForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
	layout: "auth",
});

const fields: AuthFormField[] = [
	{
		label: "Email",
		name: "email",
		placeholder: "Enter your email",
		required: true,
		type: "email",
	},
	{
		label: "Password",
		name: "password",
		placeholder: "Enter your password",
		required: true,
		type: "password",
	},
	{
		label: "Remember me",
		name: "remember",
		type: "checkbox",
	},
];

const schema = z.object({
	email: z.email("Invalid email"),
	password: z.string("Password is required").min(8, "Must be at least 8 characters"),
	remember: z.boolean().optional(),
});

type Schema = z.output<typeof schema>;

const onSubmit = (payload: FormSubmitEvent<Schema>) => {
	console.log("Submitted", payload);
};
</script>
