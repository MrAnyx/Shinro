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
						:label="userStore.username"
						:trailingIcon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
						color="neutral"
						:avatar="{ alt: userStore.username }"
						variant="ghost"
						block
						:square="collapsed"
						class="data-[state=open]:bg-elevated"
						:ui="{ trailingIcon: 'text-dimmed' }"
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
const serieStore = useSerieStore();
const userStore = useUserStore();
const mediaStore = useMediaStore();
const config = useClientConfig();

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
const mediaItems = computed<NavigationMenuItem[]>(() => {
	const items: (NavigationMenuItem | false)[] = [
		{
			label: "Media",
			type: "label",
			badge: mediaStore.total,
		},
		config.enableMovies && {
			label: "Movies",
			badge: movieStore.total,
			icon: "i-lucide-clapperboard",
			to: "/app/movies",
		},
		config.enableSeries && {
			label: "Series",
			icon: "i-lucide-tv-minimal-play",
			badge: serieStore.total,
			to: "/app/series",
		},
		config.enableMusics && {
			label: "Music",
			icon: "i-lucide-music",
			badge: { label: "Soon", color: "info" },
			to: "#",
			disabled: true,
		},
		config.enableBooks && {
			label: "Books",
			icon: "i-lucide-book-open",
			badge: { label: "Soon", color: "info" },
			to: "#",
			disabled: true,
		},
		config.enableGames && {
			label: "Games",
			icon: "i-lucide-gamepad-2",
			badge: { label: "Soon", color: "info" },
			to: "#",
			disabled: true,
		},
	];

	return items.filter(Boolean) as NavigationMenuItem[];
});

const sidebarSecondaryItems: NavigationMenuItem[] = [
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
			label: userStore.username,
			type: "label",
			avatar: {
				alt: userStore.username,
			},
		},
	],
	[
		{
			label: "Settings",
			icon: "i-lucide-settings",
			to: "/app/settings/profile",
		},
	],
	[
		{
			label: "Sign out",
			icon: "i-lucide-log-out",
			color: "error",
			async onSelect() {
				await userStore.logout();
				await navigateTo("/");
			},
		},
	],
]);
</script>
