<template>
	<UCard :ui="{ body: 'p-0! h-full border-0!' }" class="h-80 border-0!" v-if="isExternal">
		<NuxtImg provider="tmdb" src="/2w4xG178RpB4MDAIfTkqAuSJzec.jpg" class="object-cover w-full h-full" />
	</UCard>
</template>
<script setup lang="ts">
definePageMeta({
	layout: "app",
	middleware: ["auth"],
	validate(route) {
		return typeof route.params.type === "string" && ["internal", "external"].includes(route.params.type);
	},
});

const route = useRoute();
const trpc = useTrpc();

const type = computed(() => route.params.type as "internal" | "external");
const id = computed(() => route.params.id as string);
const isExternal = computed(() => type.value === "external");
const isInternal = computed(() => type.value === "internal");

onMounted(async () => {
	const tmp = await trpc.tmdb.details.query({ id: id.value });
});
</script>
