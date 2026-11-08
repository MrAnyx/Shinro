<template>
	<UHeader mode="modal">
		<template #title>
			<div class="flex flex-row items-center gap-x-1 text-highlighted">
				<NuxtImg src="/images/icone.svg" class="size-12" />
				<span class="font-brand text-3xl font-medium hidden md:inline">Shinro</span>
			</div>
		</template>

		<UNavigationMenu :items="navbarItems" content-orientation="vertical" />

		<template #right>
			<UColorModeButton />
			<UButton
				color="neutral"
				label="Get started"
				variant="solid"
				trailing-icon="i-lucide-arrow-right"
				to="/app"
			/>
		</template>

		<template #body>
			<UNavigationMenu :items="navbarItems" orientation="vertical" />
		</template>
	</UHeader>

	<slot />

	<UFooter class="border-t border-default bg-elevated/30" :ui="{ container: 'border-t border-default' }">
		<template #top>
			<UContainer>
				<UFooterColumns :columns="footerColumns" aria-label="Footer navigation">
					<template #left>
						<NuxtLink to="/" class="inline-flex items-center gap-2 text-highlighted">
							<NuxtImg src="/images/icone.svg" alt="" class="size-10" />
							<span class="font-brand text-3xl font-medium">Shinro</span>
						</NuxtLink>
						<p class="mt-4 max-w-xs text-sm leading-6 text-muted">
							A home for your media collection, and all the things you swear you'll watch eventually.
						</p>
					</template>
				</UFooterColumns>
			</UContainer>
		</template>

		<template #left>
			<p class="text-muted text-sm">© {{ new Date().getFullYear() }} Shinro</p>
		</template>

		<template #right>
			<UButton
				icon="i-simple-icons-github"
				aria-label="Shinro on GitHub (opens in a new tab)"
				color="neutral"
				variant="ghost"
				to="https://github.com/MrAnyx/Shinro"
				target="_blank"
				rel="noopener noreferrer"
			/>
		</template>
	</UFooter>
</template>

<script setup lang="ts">
import type { FooterColumn, NavigationMenuItem } from "@nuxt/ui";

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
				description: "Learn what information Shinro handles and how to manage it.",
				to: "/privacy-policy",
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

const footerColumns: FooterColumn[] = [
	{
		label: "Explore",
		children: [
			{ label: "Home", to: "/" },
			{ label: "Open Shinro", to: "/app" },
			{ label: "Privacy policy", to: "/privacy-policy" },
		],
	},
	{
		label: "Project",
		children: [
			{ label: "Documentation", to: "https://github.com/MrAnyx/Shinro#readme", target: "_blank" },
			{
				label: "Roadmap",
				to: "https://sites.plane.so/issues/cc8e5191c1414100b523437ec8cf82b4",
				target: "_blank",
			},
			{ label: "Source code", to: "https://github.com/MrAnyx/Shinro", target: "_blank" },
		],
	},
	{
		label: "Community",
		children: [
			{ label: "Report an issue", to: "https://github.com/MrAnyx/Shinro/issues", target: "_blank" },
			{ label: "Contribute", to: "https://github.com/MrAnyx/Shinro#contributing", target: "_blank" },
			{ label: "License", to: "https://github.com/MrAnyx/Shinro/blob/HEAD/LICENSE", target: "_blank" },
		],
	},
];
</script>
