<template>
	<div
		ref="wrapperRef"
		class="overflow-hidden"
		:style="{
			width: wrapperWidth,
			height: wrapperHeight,
		}"
	>
		<USkeleton class="w-full h-full" v-if="props.loading" />
		<template v-else>
			<NuxtImg
				v-if="props.src"
				:provider="props.provider"
				:src="props.src"
				class="w-full h-full object-cover"
				:width="resolvedWidth"
				:height="resolvedHeight"
			/>
			<NuxtImg v-else :src="fallbackImageUrl" class="w-full h-full object-cover" />
		</template>
	</div>
</template>

<script setup lang="ts">
import type { ConfiguredImageProviders } from "@nuxt/image";

const props = defineProps<{
	provider?: keyof ConfiguredImageProviders;
	src?: string | null;
	width?: string | number;
	height?: string | number;
	loading?: boolean;
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const measuredWidth = ref<number | null>(null);
const measuredHeight = ref<number | null>(null);
let resizeObserver: ResizeObserver | null = null;

const wrapperWidth = computed(() => {
	if (props.width == null) {
		return "100%";
	}

	return typeof props.width === "number" ? `${props.width}px` : props.width;
});

const wrapperHeight = computed(() => {
	if (props.height == null) {
		return "100%";
	}

	return typeof props.height === "number" ? `${props.height}px` : props.height;
});

const resolvedWidth = computed(() => {
	if (typeof props.width === "number") {
		return props.width;
	}

	if (typeof props.width === "string") {
		return Number(props.width.replace(/[^0-9]/g, "")) || measuredWidth.value || 300;
	}

	return measuredWidth.value || 300;
});

const resolvedHeight = computed(() => {
	if (typeof props.height === "number") {
		return props.height;
	}

	if (typeof props.height === "string") {
		return Number(props.height.replace(/[^0-9]/g, "")) || measuredHeight.value || 300;
	}

	return measuredHeight.value || 300;
});

const fallbackImageUrl = computed(() => `https://placehold.co/${resolvedWidth.value}x${resolvedHeight.value}`);

onMounted(() => {
	if (!wrapperRef.value || typeof ResizeObserver === "undefined") {
		return;
	}

	resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const rect = entry.contentRect;
			measuredWidth.value = Math.round(rect.width) || null;
			measuredHeight.value = Math.round(rect.height) || null;
		}
	});

	resizeObserver.observe(wrapperRef.value);
});

onBeforeUnmount(() => {
	if (resizeObserver && wrapperRef.value) {
		resizeObserver.unobserve(wrapperRef.value);
		resizeObserver.disconnect();
	}
});
</script>
