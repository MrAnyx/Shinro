<template>
	<div class="flex gap-x-3 overflow-x-auto pb-2">
		<template v-if="loading">
			<USkeleton v-for="i in 4" :key="i" class="w-[170px] h-[300px] rounded-sm shrink-0" />
		</template>
		<template v-else-if="internalCredits.length > 0">
			<DetailsCreditCard
				v-for="(credit, index) in internalCredits"
				:key="index"
				:to="props.creditCardToFn(credit)"
				:image="credit.profile_path ?? undefined"
				:name="credit.name ?? undefined"
				:character="credit.character ?? undefined"
				:image-provider="props.imageProvider"
				class="w-[180px] h-[300px] shrink-0"
			/>
			<DetailsIconCreditCard
				v-if="hasAdditionalCredits"
				:to="props.showMoreTo"
				title="View all"
				:subtitle="`${total} cast members`"
				icon="i-lucide-external-link"
				class="w-[180px] h-[300px] shrink-0"
			/>
		</template>
		<DetailsIconCreditCard
			v-else
			title="Empty"
			subtitle="No credits available"
			icon="i-lucide-ban"
			class="w-[180px] h-[300px] shrink-0"
		/>
	</div>
</template>

<script setup lang="ts">
import type { ConfiguredImageProviders } from "@nuxt/image";

import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from "#vue-router";

interface Credit {
	id: string;
	profile_path?: string | null;
	name?: string | null;
	character?: string | null;
}

const props = defineProps<{
	credits?: Credit[];
	imageProvider?: keyof ConfiguredImageProviders;
	creditCardToFn: (credit: Credit) => string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
	loading?: boolean;
	showMoreTo?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
}>();

const internalCredits = computed(() => props.credits?.slice(0, MAX_CREDITS) ?? []);
const total = computed(() => props.credits?.length ?? 0);
const hasAdditionalCredits = computed(() => total.value > internalCredits.value.length);
</script>
