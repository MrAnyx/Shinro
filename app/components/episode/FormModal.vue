<template>
	<UModal title="Update episode" :dismissible="!isLoading" :close="!isLoading">
		<template #body>
			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				:validate-on="['change']"
				class="gap-4 flex flex-col"
				@submit="onSubmit"
			>
				<UFormField v-if="canEditSeason" label="Season" name="seasonId" required>
					<SeasonSelectMenu
						v-model="state.seasonId"
						:initial-season="episode.season"
						class="w-full"
						:disabled="isLoading"
					/>
				</UFormField>
				<UFormField v-if="canEditSeason" label="Number" name="number" required>
					<UInputNumber v-model="state.number" class="w-full" :min="0" :disabled="isLoading" />
				</UFormField>
				<UFormField label="Title" name="name" required>
					<UInput
						v-model="state.name"
						class="w-full"
						:maxlength="MEDIA_NAME_MAX_LENGTH"
						autofocus
						:disabled="isLoading"
					/>
				</UFormField>
				<UFormField label="Status" name="status">
					<StatusSelectMenu
						v-model="state.status"
						class="w-full"
						:type="MediaType.EPISODE"
						:disabled="isLoading"
					/>
				</UFormField>
				<UFormField label="Collections" name="collections">
					<CollectionSelectMenu v-model="state.collections" class="w-full" :disabled="isLoading" />
				</UFormField>
				<UFormField label="Overview" name="overview">
					<UTextarea v-model="state.overview" class="w-full" autoresize :maxrows="10" :disabled="isLoading" />
				</UFormField>
				<UFormField label="Note" name="note">
					<UTextarea
						v-model="state.note"
						class="w-full"
						autoresize
						:maxrows="4"
						:maxlength="MEDIA_NOTE_MAX_LENGTH"
						:disabled="isLoading"
					/>
				</UFormField>
				<UFormField label="Rating" name="rating">
					<ClearableRating v-model="state.rating" :disabled="isLoading" />
				</UFormField>
			</UForm>
		</template>
		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" :disabled="isLoading" @click="emit('close')" />
			<UButton
				label="Update"
				:loading="isSubmitting"
				:disabled="isLoading || !collections"
				@click="form?.submit()"
			/>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

import { MediaType, SourceType } from "#prisma/enums";

const props = defineProps<{ episode: EpisodeWithParents }>();
const emit = defineEmits<{ close: [value?: EpisodeWithParents] }>();
const trpc = useTrpc();
const toast = useStatusToast();
const form = useTemplateRef("form");
const isSubmitting = ref(false);
const canEditSeason = computed(() => props.episode.media.source === SourceType.INTERNAL);
const { data: collections, pending: loadingCollections } = useClientAsyncData(
	() => trpc.media.getCollections.query({ type: "id", id: props.episode.id }),
	{ defaultErrorMessage: "Failed to fetch episode collections" },
);
const isLoading = computed(() => loadingCollections.value || isSubmitting.value);
const schema = z.object({
	seasonId: ClientSeasonValidation.id,
	number: ClientSeasonValidation.number,
	name: ClientMediaValidation.name,
	overview: ClientSerieValidation.overview,
	note: ClientMediaValidation.note,
	status: ClientMediaValidation.status.optional(),
	rating: ClientMediaValidation.rating.optional(),
	collections: z.array(ClientCollectionValidation.id),
});
type Schema = z.infer<typeof schema>;
const state = reactive<Schema>({
	seasonId: props.episode.seasonId,
	number: props.episode.number,
	name: props.episode.media.name ?? "",
	overview: props.episode.overview ?? "",
	note: props.episode.media.note ?? "",
	status: props.episode.media.status ?? undefined,
	rating: props.episode.media.rating ?? undefined,
	collections: [],
});
watch(collections, (value) => {
	if (value) {
		state.collections = value.map((collection) => collection.id);
	}
});

const onSubmit = (payload: FormSubmitEvent<Schema>) =>
	toast.withErrorToast(async () => {
		try {
			isSubmitting.value = true;
			const episode = await trpc.episode.update.mutate({
				id: props.episode.id,
				name: payload.data.name,
				overview: payload.data.overview,
				note: payload.data.note,
				status: payload.data.status ?? null,
				rating: payload.data.rating ?? null,
				collectionIds: payload.data.collections,
				...(canEditSeason.value ? { seasonId: payload.data.seasonId, number: payload.data.number } : {}),
			});
			emit("close", episode);
		} finally {
			isSubmitting.value = false;
		}
	});
</script>
