<template>
	<UDashboardGroup unit="px">
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
				<div class="flex flex-row items-center gap-x-1" :class="{ 'mx-auto': !collapsed }">
					<img src="~/assets/images/icone.svg" class="size-11" />
					<span class="font-brand text-4xl" v-show="!collapsed">Shinro</span>
				</div>
			</template>

			<template #default="{ collapsed }">
				<UDashboardSearchButton :collapsed="collapsed" variant="subtle" />

				<UNavigationMenu :items="sidebarItems" orientation="vertical" :collapsed="collapsed" tooltip popover />
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

const commandItems: CommandPaletteItem[] = [
	{
		description: "hello world",
		label: "Hello World",
	},
];

const sidebarItems: NavigationMenuItem[] = [
	{
		label: "Dashboard",
		type: "label",
	},
	{
		label: "Home",
		icon: "i-lucide-home",
	},
	{
		label: "Tags",
		icon: "i-lucide-tags",
		badge: 4,
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
	{
		label: "Media",
		type: "label",
		badge: 4,
		class: "mt-5",
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
	{
		label: "Tools",
		type: "label",
		class: "mt-5",
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
