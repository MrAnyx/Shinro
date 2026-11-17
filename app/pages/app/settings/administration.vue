<template>
	<ColorCard title="Cache" icon="i-lucide-database">
		<div class="flex flex-col gap-y-5">
			<SettingsParameterItem
				title="Clear cache"
				description="Remove all cached server data stored in Redis. Shinro re-fetches TMDb data on demand, so pages may load more slowly until the cache is rebuilt. Accounts, sessions, and library data are not affected."
			>
				<UButton
					label="Clear cache"
					icon="i-lucide-refresh-cw"
					class="self-end"
					color="warning"
					variant="subtle"
					:loading="isLoadingCache"
					@click="clearCache"
				/>
			</SettingsParameterItem>
		</div>
	</ColorCard>
</template>

<script setup lang="ts">
definePageMeta({
	middleware: ["admin"],
});

const { openConfirmationModal } = useConfirmation();
const toast = useStatusToast();
const trpc = useTrpc();

const _clearCache = async () => {
	const result = await openConfirmationModal(() => trpc.cache.clear.mutate(), { color: "warning" });

	if (result) {
		toast.success({ description: "Cache has been cleared" });
	}
};

const { loading: isLoadingCache, execute: clearCache } = useLoadingWrapper(_clearCache);
</script>
