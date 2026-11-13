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

// Use default style
const neutralVariantClasses: CardVariantClasses = {
	solid: { root: "", header: "", title: "" },
	outline: { root: "", header: "", title: "" },
	soft: { root: "", header: "", title: "" },
	subtle: { root: "", header: "", title: "" },
};

// Class strings must stay literal so Tailwind's scanner can detect them
const colorVariantClasses: Record<AppColor, CardVariantClasses> = {
	primary: {
		solid: { root: "bg-primary", header: "bg-primary", title: "text-inverted" },
		outline: { root: "ring ring-primary/25 divide-primary/15", header: "", title: "text-primary" },
		soft: { root: "bg-primary/5 divide-primary/15", header: "bg-primary/10", title: "text-primary" },
		subtle: {
			root: "ring ring-primary/25 bg-primary/5 divide-primary/15",
			header: "bg-primary/10",
			title: "text-primary",
		},
	},
	secondary: {
		solid: { root: "bg-secondary", header: "bg-secondary", title: "text-inverted" },
		outline: { root: "ring ring-secondary/25 divide-secondary/15", header: "", title: "text-secondary" },
		soft: { root: "bg-secondary/5 divide-secondary/15", header: "bg-secondary/10", title: "text-secondary" },
		subtle: {
			root: "ring ring-secondary/25 bg-secondary/5 divide-secondary/15",
			header: "bg-secondary/10",
			title: "text-secondary",
		},
	},
	success: {
		solid: { root: "bg-success", header: "bg-success", title: "text-inverted" },
		outline: { root: "ring ring-success/25 divide-success/15", header: "", title: "text-success" },
		soft: { root: "bg-success/5 divide-success/15", header: "bg-success/10", title: "text-success" },
		subtle: {
			root: "ring ring-success/25 bg-success/5 divide-success/15",
			header: "bg-success/10",
			title: "text-success",
		},
	},
	info: {
		solid: { root: "bg-info", header: "bg-info", title: "text-inverted" },
		outline: { root: "ring ring-info/25 divide-info/15", header: "", title: "text-info" },
		soft: { root: "bg-info/5 divide-info/15", header: "bg-info/10", title: "text-info" },
		subtle: { root: "ring ring-info/25 bg-info/5 divide-info/15", header: "bg-info/10", title: "text-info" },
	},
	warning: {
		solid: { root: "bg-warning", header: "bg-warning", title: "text-inverted" },
		outline: { root: "ring ring-warning/25 divide-warning/15", header: "", title: "text-warning" },
		soft: { root: "bg-warning/5 divide-warning/15", header: "bg-warning/10", title: "text-warning" },
		subtle: {
			root: "ring ring-warning/25 bg-warning/5 divide-warning/15",
			header: "bg-warning/10",
			title: "text-warning",
		},
	},
	error: {
		solid: { root: "bg-error", header: "bg-error", title: "text-inverted" },
		outline: { root: "ring ring-error/25 divide-error/15", header: "", title: "text-error" },
		soft: { root: "bg-error/5 divide-error/15", header: "bg-error/10", title: "text-error" },
		subtle: { root: "ring ring-error/25 bg-error/5 divide-error/15", header: "bg-error/10", title: "text-error" },
	},
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
