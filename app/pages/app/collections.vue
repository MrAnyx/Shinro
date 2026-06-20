<template>
	<UDashboardPanel id="collections">
		<template #header>
			<UDashboardNavbar title="Collections">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<UButton label="New collection" leading-icon="i-lucide-plus" @click="onNewCollection" />
				</template>
			</UDashboardNavbar>
		</template>
	</UDashboardPanel>
</template>
<script setup lang="ts">
import { LazyAddCollectionModal } from "#components";

definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const overlay = useOverlay();
const newCollectionModal = overlay.create(LazyAddCollectionModal, {
	props: {},
});

const onNewCollection = () => {
	newCollectionModal.open();
};
</script>
