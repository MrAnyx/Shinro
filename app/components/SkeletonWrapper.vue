<template>
	<div ref="wrapperRef" :class="['relative overflow-hidden', wrapperClass]" :style="wrapperStyle">
		<div ref="contentRef" :class="loading ? 'opacity-0 pointer-events-none' : ''">
			<slot />
		</div>

		<div v-if="loading" class="absolute inset-0 flex items-center justify-center" :style="skeletonStyle">
			<USkeleton :class="['w-full h-full', skeletonClass]" v-bind="skeletonAttrs" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

interface SkeletonWrapperProps {
	loading: boolean;
	fallbackWidth?: string | number | null;
	fallbackHeight?: string | number | null;
	wrapperClass?: string;
	skeletonClass?: string;
	skeletonAttrs?: Record<string, unknown>;
}

const props = defineProps<SkeletonWrapperProps>();

const wrapperRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const measuredWidth = ref<number | null>(null);
const measuredHeight = ref<number | null>(null);
let resizeObserver: ResizeObserver | null = null;

const wrapperStyle = computed(() => {
	const style: Record<string, string> = {};

	if (props.fallbackWidth != null) {
		style.width = typeof props.fallbackWidth === "number" ? `${props.fallbackWidth}px` : props.fallbackWidth;
	}

	if (props.fallbackHeight != null) {
		style.height = typeof props.fallbackHeight === "number" ? `${props.fallbackHeight}px` : props.fallbackHeight;
	}

	return style;
});

const skeletonStyle = computed(() => {
	return {
		width: measuredWidth.value != null ? `${measuredWidth.value}px` : undefined,
		height: measuredHeight.value != null ? `${measuredHeight.value}px` : undefined,
	};
});

onMounted(() => {
	if (!contentRef.value || typeof ResizeObserver === "undefined") {
		return;
	}

	resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const rect = entry.contentRect;
			measuredWidth.value = Math.round(rect.width) || null;
			measuredHeight.value = Math.round(rect.height) || null;
		}
	});

	resizeObserver.observe(contentRef.value);
});

onBeforeUnmount(() => {
	if (resizeObserver && contentRef.value) {
		resizeObserver.unobserve(contentRef.value);
		resizeObserver.disconnect();
	}
});
</script>
