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
import { z } from "zod";

definePageMeta({
	layout: "auth",
	middleware: ["guest-only"],
});

const userStore = useUserStore();
const toast = useStatusToast();

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
