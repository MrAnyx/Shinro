<template>
	<UHeader mode="modal">
		<template #title>
			<div class="flex flex-row items-center gap-x-1 text-highlighted">
				<img src="~/assets/images/icone.svg" class="size-12" />
				<span class="font-brand text-3xl font-medium hidden md:inline">Shinro</span>
			</div>
		</template>

		<UNavigationMenu :items="navbarItems" content-orientation="vertical" />

		<template #right>
			<UColorModeButton />
			<UButton color="neutral" label="Get started" variant="solid" trailing-icon="i-lucide-arrow-right" to="/app" />
		</template>

		<template #body>
			<UNavigationMenu :items="navbarItems" orientation="vertical" />
		</template>
	</UHeader>

	<slot />

	<UFooter>
		<template #left>
			<p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }}</p>
		</template>

		<img src="~/assets/images/icone.svg" class="size-8" />

		<template #right>
			<UButton icon="i-simple-icons-github" color="neutral" variant="ghost" to="https://github.com/nuxt/nuxt" target="_blank" aria-label="GitHub" />
		</template>
	</UFooter>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const navbarItems = ref<NavigationMenuItem[]>([
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
		label: "Roadmap",
		icon: "i-lucide-map",
		to: "https://sites.plane.so/issues/cc8e5191c1414100b523437ec8cf82b4",
		target: "_blank",
	},
]);

const footerItems: NavigationMenuItem[] = [
	{
		label: "Figma Kit",
		to: "https://go.nuxt.com/figma-ui",
		target: "_blank",
	},
	{
		label: "Playground",
		to: "https://stackblitz.com/edit/nuxt-ui",
		target: "_blank",
	},
	{
		label: "Releases",
		to: "https://github.com/nuxt/ui/releases",
		target: "_blank",
	},
];
</script>
