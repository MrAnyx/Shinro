<template>
	<UAuthForm :schema="schema" title="Login" icon="i-lucide-user-check" :fields="fields" @submit="onSubmit" :submit="{ label: 'Login' }">
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
import * as z from "zod";

definePageMeta({
	layout: "auth",
	middleware: ["guest-only"],
});

const trpc = useTrpc();
const toast = useToast();
const { setLoggedIn } = useAuth();
const { usernameRule, passwordRule } = useValidationRule();

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
	username: usernameRule,
	password: passwordRule,
});

type Schema = z.output<typeof schema>;

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		const user = await trpc.users.login.mutate({
			username: payload.data.username,
			password: payload.data.password,
		});

		setLoggedIn();

		toast.add({
			title: `Hello ${user.username}`,
			description: "Welcome back",
			color: "success",
		});

		await navigateTo({ path: "/" });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";

		toast.add({
			title: "Authentication failed",
			description: message,
			color: "error",
		});
	}
};
</script>
