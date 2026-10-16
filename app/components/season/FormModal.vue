<template>
	<UModal :dismissible="!isLoading" :close="!isLoading">
		<template #title>
			<div class="flex items-center gap-x-2">
				<Spinner class="size-5" v-if="isInitializing" />
				<span>{{ isUpdate ? "Update" : "Create" }} a season</span>
			</div>
		</template>
		<template #body>
			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				@submit="onSubmit"
				:validate-on="['change']"
				class="gap-4 flex flex-col"
			>
				<UFormField label="Title" name="name" required>
					<UInput
						v-model="state.name"
						class="w-full"
						:maxlength="255"
						autofocus
						:disabled="isLoading"
						:loading="loadingSeason"
					/>
				</UFormField>

				<UFormField label="Number" name="number" required>
					<UInputNumber
						v-model="state.number"
						class="w-full"
						orientation="vertical"
						:disabled="isLoading"
						:loading="loadingSeason"
						:min="1"
					/>
				</UFormField>

				<UFormField label="Serie" name="serie" required>
					<UTooltip
						text="The serie of an external season can't be changed"
						:disabled="isInternal || isCreate"
						class="w-full"
					>
						<SerieSelectMenu
							class="w-full"
							:source="SourceType.INTERNAL"
							v-model="state.serie"
							:fallback-serie="season?.serie"
							:disabled="isLoading || isExternal"
							:loading="loadingSeason"
						/>
					</UTooltip>
				</UFormField>

				<UFormField label="Status" name="status">
					<StatusSelectMenu
						class="w-full"
						v-model="state.status"
						:disabled="isLoading"
						:loading="loadingSeason"
					/>
				</UFormField>
				<UFormField label="Collections" name="collections">
					<CollectionSelectMenu
						class="w-full"
						v-model="state.collections"
						:disabled="isLoading"
						:loading="loadingCollections"
					/>
				</UFormField>
				<UFormField label="Overview" name="overview">
					<UTextarea
						v-model="state.overview"
						class="w-full"
						autoresize
						:maxrows="10"
						:disabled="isLoading"
						:loading="loadingSeason"
					/>
				</UFormField>
				<UFormField label="Note" name="note">
					<UTextarea
						v-model="state.note"
						class="w-full"
						autoresize
						:maxrows="4"
						:maxlength="1000"
						:disabled="isLoading"
						:loading="loadingSeason"
					/>
				</UFormField>
				<UFormField label="Rating" name="rating">
					<ClearableRating v-model="state.rating" :disabled="isLoading" :loading="loadingSeason" />
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton
				:label="isUpdate ? 'Update' : 'Create'"
				@click="onSave"
				:loading="isSubmitting"
				:disabled="isInitializing"
			/>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

import { SourceType } from "#prisma/enums";

const props = defineProps<{ id?: string }>();

const emit = defineEmits<{
	close: [value?: { season: SeasonWithSerie; collections: Collection[] }];
}>();

const isSubmitting = ref(false);
const form = useTemplateRef("form");
const toast = useStatusToast();
const trpc = useTrpc();
const seasonStore = useSeasonStore();

const isCreate = computed(() => !props.id);
const isUpdate = computed(() => !!props.id);
const isInitializing = computed(() => loadingSeason.value || loadingCollections.value);
const isLoading = computed(() => isInitializing.value || isSubmitting.value);

const schema = z.object({
	name: ClientMediaValidation.name,
	status: ClientMediaValidation.status,
	collections: z.array(ClientCollectionValidation.id),
	overview: ClientSeasonValidation.overview,
	note: ClientMediaValidation.note,
	rating: ClientMediaValidation.rating,
	serie: ClientSerieValidation.id,
	number: ClientSeasonValidation.number,
});
type Schema = z.infer<typeof schema>;

const isInternal = computed(() => season.value && season.value.media.source === SourceType.INTERNAL);
const isExternal = computed(() => season.value && season.value.media.source === SourceType.EXTERNAL);
const { data: season, pending: loadingSeason } = useClientAsyncData(
	() => trpc.season.getById.query({ type: "id", id: props.id! }),
	{ enabled: () => !!props.id },
);

watch(season, (m) => {
	if (!m) {
		return;
	}
	state.name = m.media.name ?? "";
	state.status = m.media.status ?? undefined;
	state.note = m.media.note ?? "";
	state.overview = m.overview ?? "";
	state.rating = m.media.rating ?? undefined;
	state.serie = m.serieId;
});

const { data: collections, pending: loadingCollections } = useClientAsyncData(
	() => trpc.media.getCollections.query({ type: "id", id: props.id! }),
	{ enabled: () => !!props.id },
);

watch(collections, (c) => {
	if (!c) {
		return;
	}
	state.collections = c.map((col) => col.id);
});

const state = reactive<Schema>({
	name: "",
	status: undefined,
	collections: [],
	note: "",
	overview: "",
	rating: undefined,
	serie: "",
	number: 1,
});

const onCancel = () => {
	emit("close");
};

const onSave = async () => {
	form.value?.submit();
};

const onSubmit = async (payload: FormSubmitEvent<Schema>) =>
	toast.withErrorToast(async () => {
		// try {
		// 	isSubmitting.value = true;
		// 	let updatedSeason;
		// 	if (props.id) {
		// 		// updatedSeason = await trpc.season.update.mutate({
		// 		// 	id: props.id,
		// 		// 	name: payload.data.name,
		// 		// 	overview: payload.data.overview,
		// 		// 	rating: payload.data.rating ?? null,
		// 		// 	note: payload.data.note,
		// 		// 	number: payload.data.number,
		// 		// 	serieId: payload.data.serie,
		// 		// 	status: payload.data.status ?? null,
		// 		// });
		// 	} else {
		// 		updatedSeason = await seasonStore.createSeasonFromInternal({
		// 			name: payload.data.name,
		// 			status: payload.data.status ?? null,
		// 			overview: payload.data.overview,
		// 			note: payload.data.note,
		// 			rating: payload.data.rating ?? null,
		// 			serieId: payload.data.serie,
		// 			number: payload.data.number,
		// 		});
		// 	}
		// 	const updatedCollections = await trpc.media.updateCollections.mutate({
		// 		id: updatedSeason.id,
		// 		collectionIds: payload.data.collections,
		// 	});
		// 	emit("close", { season: updatedSeason, collections: updatedCollections });
		// } finally {
		// 	isSubmitting.value = false;
		// }
	});
</script>
