<template>
	<div class="flex flex-col gap-y-1">
		<template v-if="props.loading ?? false">
			<USkeleton class="w-1/2 h-[32px] rounded-sm" />
			<USkeleton class="w-1/3 h-[24px] rounded-sm" />
		</template>
		<template v-else>
			<h1 class="font-bold text-4xl">
				{{ props.title ?? "No title available" }}
			</h1>
			<h3 class="italic text-muted text-sm" v-if="props.subtitle">{{ props.subtitle }}</h3>
		</template>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	loading?: boolean;
	title?: string;
	subtitle?: string;
}>();
</script>
