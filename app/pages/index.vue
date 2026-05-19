<template>
	<UButton>{{ data.text }}</UButton>
</template>

<script lang="ts" setup>
const { $trpc } = useNuxtApp();

const data = await $trpc.greeting.query();
</script>
