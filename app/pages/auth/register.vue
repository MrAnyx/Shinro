<template>
	<UAuthForm
		:schema="schema"
		title="Register"
		icon="i-lucide-user-plus"
		:fields="fields"
		@submit="onSubmit"
		:loading="isLoading"
		:submit="{ label: 'Register' }"
		:validate-on="['change']"
	>
		<template #description>
			<div>
				Already have an account?
				<ULink to="/auth/login" class="text-primary font-medium">Log in to your eternal commitment</ULink>.
			</div>
		</template>
		<template #footer>
			By signing up, you confirm that your watchlist is about to become a personality trait.
		</template>
	</UAuthForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { z } from "zod";

definePageMeta({
	layout: "auth",
	middleware: [
		"guest-only",
		() => {
			const config = useClientConfig();

			if (!config.allowRegistration) {
				return abortNavigation({
					statusCode: 404,
					statusMessage: "Not Found",
					statusText: "The page you are looking for does not exist",
				});
			}
		},
	],
});

const toast = useStatusToast();
const userStore = useUserStore();

const isLoading = ref(false);

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
		username: ClientUserValidation.username,
		password: ClientUserValidation.password,
		password_confirmation: ClientUserValidation.password,
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords must match",
		path: ["password_confirmation"],
	});

type Schema = z.output<typeof schema>;

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;
		await userStore.register(payload.data);
		await navigateTo({ path: "/app" });
	} catch (err) {
		toast.error(err);
	} finally {
		isLoading.value = false;
	}
};
</script>
