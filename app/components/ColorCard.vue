<template>
	<UCard :ui="cardUi" :variant="props.variant">
		<template #title v-if="hasHeader">
			<div class="flex items-center gap-x-2" :class="titleColorClass">
				<UIcon :name="props.icon" class="size-5" v-if="props.icon" />
				<span v-if="props.title">{{ props.title }}</span>
			</div>
		</template>
		<slot />
	</UCard>
</template>

<script setup lang="ts">
import type { CardProps } from "@nuxt/ui";

const props = defineProps<
	{
		title?: string;
		icon?: string;
		color?: AppColor;
	} & Pick<CardProps, "variant">
>();

const hasHeader = computed(() => props.title || props.icon);

type CardVariant = NonNullable<CardProps["variant"]>;
type CardVariantClasses = Record<CardVariant, { root: string; header: string; title: string }>;

function getColorVariantClasses(color: Exclude<AppColor, "neutral">): CardVariantClasses {
	return {
		solid: {
			root: `bg-${color}`,
			header: `bg-${color}`,
			title: "text-inverted",
		},
		outline: {
			root: `ring ring-${color}/25 divide-${color}/15`,
			header: "",
			title: `text-${color}`,
		},
		soft: {
			root: `bg-${color}/5 divide-${color}/15`,
			header: `bg-${color}/10`,
			title: `text-${color}`,
		},
		subtle: {
			root: `ring ring-${color}/25 bg-${color}/5 divide-${color}/15`,
			header: `bg-${color}/10`,
			title: `text-${color}`,
		},
	};
}

// Use default style
const neutralVariantClasses: CardVariantClasses = {
	solid: { root: "", header: "", title: "" },
	outline: { root: "", header: "", title: "" },
	soft: { root: "", header: "", title: "" },
	subtle: { root: "", header: "", title: "" },
};

const colorVariantClasses: Record<AppColor, CardVariantClasses> = {
	primary: getColorVariantClasses("primary"),
	secondary: getColorVariantClasses("secondary"),
	success: getColorVariantClasses("success"),
	info: getColorVariantClasses("info"),
	warning: getColorVariantClasses("warning"),
	error: getColorVariantClasses("error"),
	neutral: neutralVariantClasses,
};

const cardUi = computed(() => {
	if (!props.color) {
		return undefined;
	}

	const variant = (props.variant ?? "outline") as CardVariant;
	const colors = colorVariantClasses[props.color][variant];

	return {
		root: colors.root,
		header: colors.header,
	};
});

const titleColorClass = computed(() => {
	if (!props.color) {
		return undefined;
	}

	const variant = (props.variant ?? "outline") as CardVariant;
	return colorVariantClasses[props.color][variant].title;
});
</script>
