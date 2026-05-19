<template>
	<UButton>{{ data }}</UButton>
</template>

<script lang="ts" setup>
const { $trpc } = useNuxtApp();

const data = await $trpc.hello.query({ name: "world" });
</script>
