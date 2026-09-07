<template>
	<div class="flex">
		<div class="w-1/2 shrink-0">
			<h2 class="font-medium">{{ props.title }}</h2>
			<span class="text-sm text-muted" v-if="props.description">
				{{ props.description }}
			</span>
		</div>
		<div class="flex-1 my-auto flex flex-col gap-y-3">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	title: string;
	description?: string;
}>();
</script>
