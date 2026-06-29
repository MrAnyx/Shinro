<template>
	<UPageHero
		description="The all-in-one digital sanctuary for hoarders, procrastinators, and media enthusiasts who need to organize their books, movies, series, and existential dread—because life’s too short to remember what you’ve read, watched, or pretended to care about."
		:links="heroButtons"
	>
		<template #title>
			Finally a place for your
			<span class="font-brand underline decoration-dashed decoration-3 decoration-primary underline-offset-8">Chaos</span>
		</template>

		<ImagePlaceholder />
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

	<UPageSection>
		<UPageCTA
			title="Join the Club of Chronic Collectors"
			description="Connect with fellow hoarders, procrastinators, and media enthusiasts who finally get it. No judgment, just organization—and maybe a little existential dread."
			variant="subtle"
			:links="heroButtons"
		/>
	</UPageSection>
</template>

<script setup lang="ts">
import type { ButtonProps, PageFeatureProps } from "@nuxt/ui";

definePageMeta({
	layout: "landing",
});

const heroButtons = ref<ButtonProps[]>([
	{
		label: "Get started",
		to: "/app",
		color: "neutral",
		trailingIcon: "i-lucide-arrow-right",
	},
	{
		label: "Learn more",
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
