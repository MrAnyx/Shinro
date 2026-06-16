<template></template>
<script setup lang="ts">
definePageMeta({
	layout: "app",
	middleware: ["auth"],
});

const trpc = useTrpc();

await trpc.collections.getAll.query({ page: 1 });
</script>
