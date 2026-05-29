<template>
	<UAuthForm
		:schema="schema"
		title="Register"
		icon="i-lucide-user-plus"
		:fields="fields"
		@submit="onSubmit"
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
import * as z from "zod";

definePageMeta({
	layout: "auth",
	middleware: ["registration", "guest-only"],
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
		username: usernameRule,
		password: passwordRule,
		password_confirmation: passwordRule,
	})
	.refine((data) => data.password === data.password_confirmation, { message: "Passwords must match", path: ["password_confirmation"] });

type Schema = z.output<typeof schema>;

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		await trpc.users.register.mutate({
			username: payload.data.username,
			password: payload.data.password,
		});

		setLoggedIn();

		await navigateTo({ path: "/app" });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";

		toast.add({
			title: "Registration failed",
			description: message,
			color: "error",
		});
	}
};
</script>
