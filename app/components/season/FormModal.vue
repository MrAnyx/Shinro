<template>
	<UModal :dismissible="!isLoading" :close="!isLoading">
		<template #title>
			<div class="flex items-center gap-x-2">
				<Spinner v-if="isInitializing" class="size-5" />
				<span>{{ props.id ? "Update" : "Create" }} season</span>
			</div>
		</template>
		<template #body>
			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				:validate-on="['change']"
				class="gap-4 flex flex-col"
				@submit="onSubmit"
			>
				<UFormField v-if="canEditSerie" label="Series" name="serieId" required>
					<SerieSelectMenu v-model="state.serieId" class="w-full" :disabled="isLoading" />
				</UFormField>
				<UFormField v-if="canEditSerie" label="Number" name="number" required>
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
						:type="MediaType.SEASON"
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
				:label="props.id ? 'Update' : 'Create'"
				:loading="isSubmitting"
				:disabled="isInitializing || (!!props.id && (!season || !collections))"
				@click="form?.submit()"
			/>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

import { MediaType, SourceType } from "#prisma/enums";

const props = defineProps<{ id?: string; serieId?: string }>();
const emit = defineEmits<{ close: [value?: { season: Season; collections: Collection[] }] }>();
const trpc = useTrpc();
const toast = useStatusToast();
const seasonStore = useSeasonStore();
const form = useTemplateRef("form");
const isSubmitting = ref(false);
const schema = z.object({
	serieId: ClientSerieValidation.id,
	number: ClientSeasonValidation.number,
	name: ClientMediaValidation.name,
	status: ClientMediaValidation.status,
	collections: ClientCollectionValidation.ids,
	overview: ClientSerieValidation.overview,
	note: ClientMediaValidation.note,
	rating: ClientMediaValidation.rating,
});
type Schema = z.infer<typeof schema>;
const state = reactive<Partial<Pick<Schema, "serieId" | "number">> & Omit<Schema, "serieId" | "number">>({
	serieId: props.serieId,
	number: undefined,
	name: "",
	status: undefined,
	collections: [],
	overview: "",
	note: "",
	rating: undefined,
});
const { data: season, pending: loadingSeason } = useClientAsyncData(
	() => trpc.season.getById.query({ id: props.id! }),
	{
		enabled: () => !!props.id,
		defaultErrorMessage: "Failed to fetch season",
	},
);
const { data: collections, pending: loadingCollections } = useClientAsyncData(
	() => trpc.media.getCollections.query({ type: "id", id: props.id! }),
	{ enabled: () => !!props.id, defaultErrorMessage: "Failed to fetch collections" },
);
const isInitializing = computed(() => loadingSeason.value || loadingCollections.value);
const isLoading = computed(() => isInitializing.value || isSubmitting.value);
// Series and number are fixed for seasons coming from an external source
const canEditSerie = computed(() => !props.id || season.value?.media.source === SourceType.INTERNAL);
watch(season, (value) => {
	if (!value) {
		return;
	}
	state.serieId = value.serieId;
	state.number = value.number;
	state.name = value.media.name ?? "";
	state.status = value.media.status ?? undefined;
	state.overview = value.overview ?? "";
	state.note = value.media.note ?? "";
	state.rating = value.media.rating ?? undefined;
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
			const data = {
				name: payload.data.name,
				overview: payload.data.overview,
				status: payload.data.status ?? null,
				note: payload.data.note,
				rating: payload.data.rating ?? null,
			};
			const savedSeason = props.id
				? await trpc.season.update.mutate({
						id: props.id,
						...data,
						...(canEditSerie.value ? { serieId: payload.data.serieId, number: payload.data.number } : {}),
					})
				: await seasonStore.createSeasonFromInternal({
						...data,
						serieId: payload.data.serieId,
						number: payload.data.number,
					});
			const updatedCollections = await trpc.media.updateCollections.mutate({
				id: savedSeason.id,
				collectionIds: payload.data.collections,
			});
			emit("close", { season: savedSeason, collections: updatedCollections });
		} finally {
			isSubmitting.value = false;
		}
	});
</script>
