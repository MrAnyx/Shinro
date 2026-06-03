<template>
	<UPageHero
		description="The all-in-one digital sanctuary for hoarders, procrastinators, and media enthusiasts who need to organize their books, movies, series, and existential dread—because life’s too short to remember what you’ve read, watched, or pretended to care about."
		:links="links"
	>
		<template #title>
			Finally a place for you <span class="font-brand underline decoration-dashed decoration-3 decoration-primary underline-offset-8">Chaos</span>
		</template>
	</UPageHero>

	<UPageSection
		title="Tame the Chaos"
		description="Finally, a system for your scattered media and existential dread. No more losing track of what you've read, watched, or pretended to care about."
		orientation="horizontal"
		:features="features[0]"
	>
		<ImagePlaceholder />
	</UPageSection>

	<UPageSection
		title="Rediscover What You Love"
		description="Because life's too short to forget your favorite stories—or pretend you remember them."
		orientation="horizontal"
		reverse
		:features="features[1]"
	>
		<ImagePlaceholder />
	</UPageSection>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "landing",
});

import type { ButtonProps, PageFeatureProps } from "@nuxt/ui";

const links = ref<ButtonProps[]>([
	{
		label: "Get started",
		to: "/docs/getting-started",
		color: "neutral",
		trailingIcon: "i-lucide-arrow-right",
	},
	{
		label: "Learn more",
		to: "/docs/getting-started/theme/design-system",
		color: "neutral",
		variant: "subtle",
	},
]);

const features = ref<PageFeatureProps[][]>([
	[
		{
			title: "All-in-One Library",
			description: "Organize books, movies, series, and more in a single, searchable space.",
			icon: "i-lucide-component",
		},
		{
			title: "Custom Tags",
			description: 'Label your media with tags like "Guilty Pleasure", "Abandoned Halfway", or "Why Did I Buy This?"',
			icon: "i-lucide-tags",
		},
	],
	[
		{
			title: "Consumption Stats",
			description: 'Track your reading/watching habits with stats like "Most Binge-Watched Genre" or "Books You Started But Never Finished"',
			icon: "i-lucide-pie-chart",
		},
		{
			title: "Progress Tracking",
			description: 'Mark items as "Watched", "Reading", or "Lying About Having Seen This".',
			icon: "i-lucide-circle-dashed",
		},
	],
]);
</script>
