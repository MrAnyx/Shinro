<template>
	<UHeader mode="modal">
		<template #title>
			<div class="flex flex-row items-center gap-x-1 text-highlighted">
				<img src="~/assets/images/icone.svg" class="size-12" />
				<span class="font-brand text-3xl font-medium hidden md:inline">Shinro</span>
			</div>
		</template>

		<UNavigationMenu :items="items" content-orientation="vertical" />

		<template #right>
			<UColorModeButton />

			<UButton color="neutral" label="Sign in" variant="subtle" to="/auth/login" />
			<UButton color="neutral" label="Sign up" variant="solid" trailing-icon="i-lucide-arrow-right" to="/auth/register" />
		</template>

		<template #body>
			<UNavigationMenu :items="items" orientation="vertical" />
		</template>
	</UHeader>

	<slot />
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items = ref<NavigationMenuItem[]>([
	{
		label: "Guide",
		icon: "i-lucide-book-open",
		children: [
			{
				label: "Features",
				description: "Fully styled and customizable components for Nuxt.",
				icon: "i-lucide-zap",
			},
			{
				label: "Media Types",
				description: "Learn how to install and configure Nuxt UI in your application.",
				icon: "i-lucide-component",
			},
		],
	},
	{
		label: "Help",
		icon: "i-lucide-message-circle-question-mark",
		children: [
			{
				label: "Documentation",
				icon: "i-lucide-book-marked",
				description: "Use NuxtLink with superpowers.",
			},
			{
				label: "About",
				icon: "i-lucide-info",
				description: "Display a modal within your application.",
			},
			{
				label: "Privacy Policy",
				icon: "i-lucide-shield-alert",
				description: "Display a modal within your application.",
			},
		],
	},
	{
		label: "GitHub",
		icon: "i-simple-icons-github",
		to: "https://github.com/nuxt/ui",
		target: "_blank",
	},
]);
</script>
