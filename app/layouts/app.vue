<template>
	<SplashScreen v-if="isLoading || !isReady" />

	<UDashboardGroup unit="px" v-else>
		<UDashboardSidebar
			:ui="{ footer: 'border-t border-default' }"
			resizable
			collapsible
			:min-size="250"
			:default-size="300"
			:max-size="500"
			mode="slideover"
			toggle-side="left"
		>
			<template #header="{ collapsed }">
				<ULink class="flex flex-row items-center gap-x-1 text-highlighted" :class="{ 'mx-auto': !collapsed }" to="/">
					<img src="~/assets/images/icone.svg" class="size-11" />
					<span class="font-brand text-4xl" v-show="!collapsed">Shinro</span>
				</ULink>
			</template>

			<template #default="{ collapsed }">
				<UDashboardSearchButton :collapsed="collapsed" variant="subtle" />

				<UNavigationMenu :items="dashboardItems" orientation="vertical" :collapsed="collapsed" tooltip popover />
				<UNavigationMenu :items="mediaItems" orientation="vertical" :collapsed="collapsed" tooltip popover />
				<UNavigationMenu :items="toolsItems" orientation="vertical" :collapsed="collapsed" tooltip popover />
				<UNavigationMenu :items="sidebarSecondaryItems" orientation="vertical" :collapsed="collapsed" tooltip popover class="mt-auto" />
			</template>

			<template #footer="{ collapsed }">
				<UButton
					label="John Doe"
					:trailingIcon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
					color="neutral"
					:avatar="{ alt: 'John Doe' }"
					variant="ghost"
					block
					:square="collapsed"
					class="data-[state=open]:bg-elevated"
					:ui="{
						trailingIcon: 'text-dimmed',
					}"
				/>
			</template>
		</UDashboardSidebar>

		<UDashboardSearch :groups="[{ id: 'test', items: commandItems, label: 'test' }]" />

		<slot />
	</UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem, CommandPaletteItem } from "@nuxt/ui";

const { isReady, isLoading, initialize } = useInitialization();

callOnce(async () => {
	await initialize();
});

const commandItems: CommandPaletteItem[] = [
	{
		description: "hello world",
		label: "Hello World",
	},
];

const dashboardItems: NavigationMenuItem[] = [
	{
		label: "Dashboard",
		type: "label",
	},
	{
		label: "Home",
		icon: "i-lucide-home",
		to: "/app",
	},
	{
		label: "Tags",
		icon: "i-lucide-tags",
		badge: 4,
		to: "/app/tags",
	},
	{
		label: "Stats",
		badge: {
			label: "Soon",
			color: "info",
		},
		disabled: true,
		icon: "i-lucide-chart-pie",
	},
];

const mediaItems: NavigationMenuItem[] = [
	{
		label: "Media",
		type: "label",
		badge: 4,
	},
	{
		label: "Movies",
		badge: 4,
		icon: "i-lucide-clapperboard",
	},
	{
		label: "Series",
		badge: {
			label: "Soon",
			color: "info",
		},
		disabled: true,
		icon: "i-lucide-tv-minimal-play",
	},
	{
		label: "Music",
		badge: {
			label: "Soon",
			color: "info",
		},
		disabled: true,
		icon: "i-lucide-music",
	},
	{
		label: "Books",
		badge: {
			label: "Soon",
			color: "info",
		},
		disabled: true,
		icon: "i-lucide-book-open",
	},
	{
		label: "Games",
		badge: {
			label: "Soon",
			color: "info",
		},
		disabled: true,
		icon: "i-lucide-gamepad-2",
	},
];

const toolsItems: NavigationMenuItem[] = [
	{
		label: "Tools",
		type: "label",
	},
	{
		label: "Help",
		icon: "i-lucide-info",
	},
	{
		label: "Settings",
		icon: "i-lucide-settings",
		defaultOpen: true,
		children: [
			{
				label: "General",
			},
			{
				label: "Appearence",
			},
			{
				label: "Account",
			},
		],
	},
];

const sidebarSecondaryItems: NavigationMenuItem[] = [
	{
		label: "Feedback",
		icon: "i-lucide-message-circle",
		to: "https://github.com/nuxt-ui-templates/dashboard",
		target: "_blank",
	},
	{
		label: "Github",
		icon: "i-lucide-github",
		to: "https://github.com/MrAnyx/Shinro",
		target: "_blank",
	},
];
</script>
