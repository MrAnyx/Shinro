<template>
	<UApp>
		<NuxtLoadingIndicator />

		<UMain>
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</UMain>
	</UApp>
</template>

<script setup lang="ts">
useHead({
	titleTemplate: (titleChunk) => {
		return titleChunk ? `${titleChunk} - Shinro` : "Shinro";
	},
});
</script>
