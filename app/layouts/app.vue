<template>
	<SplashScreen v-if="!initializationStore.isFullyInitialized" />

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
				<ULink
					class="flex flex-row items-center gap-x-1 text-highlighted"
					:class="{ 'mx-auto': !collapsed }"
					to="/"
				>
					<NuxtImg src="/images/icone.svg" class="size-11" />
					<span class="font-brand text-4xl" v-show="!collapsed">Shinro</span>
				</ULink>
			</template>

			<template #default="{ collapsed }">
				<UDashboardSearchButton :collapsed="collapsed" variant="subtle" />

				<UNavigationMenu
					:items="dashboardItems"
					orientation="vertical"
					:collapsed="collapsed"
					tooltip
					popover
				/>
				<UNavigationMenu :items="mediaItems" orientation="vertical" :collapsed="collapsed" tooltip popover />
				<UNavigationMenu :items="toolsItems" orientation="vertical" :collapsed="collapsed" tooltip popover />
				<UNavigationMenu
					:items="sidebarSecondaryItems"
					orientation="vertical"
					:collapsed="collapsed"
					tooltip
					popover
					class="mt-auto"
				/>
			</template>

			<template #footer="{ collapsed }">
				<UDropdownMenu
					:items="userDropdown"
					:ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
				>
					<UButton
						:label="username"
						:trailingIcon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
						color="neutral"
						:avatar="{ alt: username }"
						variant="ghost"
						block
						:square="collapsed"
						class="data-[state=open]:bg-elevated"
						:ui="{
							trailingIcon: 'text-dimmed',
						}"
					/>
				</UDropdownMenu>
			</template>
		</UDashboardSidebar>

		<UDashboardSearch :groups="[{ id: 'test', items: commandItems, label: 'test' }]" />

		<slot />
	</UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem, CommandPaletteItem, DropdownMenuItem } from "@nuxt/ui";

const initializationStore = useInitializationStore();
const collectionStore = useCollectionStore();
const movieStore = useMovieStore();
const authStore = useAuthStore();
const colorTheme = useColorMode();

const username = computed(() => authStore.user?.username ?? "Unknown");

onMounted(async () => {
	await initializationStore.initialize();
});

const commandItems: CommandPaletteItem[] = [
	{
		description: "hello world",
		label: "Hello World",
	},
];

const dashboardItems = computed<NavigationMenuItem[]>(() => [
	{
		label: "Dashboard",
		type: "label",
	},
	{
		label: "Overview",
		icon: "i-lucide-home",
		to: "/app",
	},
	{
		label: "Collections",
		icon: "i-lucide-folder",
		badge: collectionStore.total,
		to: "/app/collections",
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
]);

const mediaItems = computed<NavigationMenuItem[]>(() => [
	{
		label: "Media",
		type: "label",
		badge: movieStore.total,
	},
	{
		label: "Movies",
		badge: movieStore.total,
		icon: "i-lucide-clapperboard",
		to: "/app/movies",
	},
	{
		label: "Series",
		icon: "i-lucide-tv-minimal-play",
		badge: {
			label: "Soon",
			color: "info",
		},
		disabled: true,
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
]);

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

const userDropdown = computed<DropdownMenuItem[][]>(() => [
	[
		{
			label: username.value,
			type: "label",
			avatar: {
				alt: username.value,
			},
		},
	],
	[
		{
			label: "Account",
			icon: "i-lucide-user",
		},
	],
	[
		{
			label: "Theme",
			icon: "i-lucide-palette",
			children: [
				{
					label: "Light",
					type: "checkbox",
					icon: "i-lucide-sun",
					checked: colorTheme.value === "light",
					onSelect(e: Event) {
						e.preventDefault();
						colorTheme.preference = "light";
					},
				},
				{
					label: "Dark",
					type: "checkbox",
					icon: "i-lucide-moon",
					checked: colorTheme.value === "dark",
					onSelect(e: Event) {
						e.preventDefault();
						colorTheme.preference = "dark";
					},
				},
			],
		},
		{
			label: "About",
			icon: "i-lucide-info",
		},
	],

	[
		{
			label: "Sign out",
			icon: "i-lucide-log-out",
			color: "error",
			async onSelect() {
				await authStore.logout();
				await navigateTo("/");
			},
		},
	],
]);
</script>
