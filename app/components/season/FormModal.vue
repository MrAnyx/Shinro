<template>
	<UModal :dismissible="!isLoading" :close="!isLoading">
		<template #title>
			<div class="flex items-center gap-x-2">
				<UIcon name="i-lucide-loader-circle" class="animate-spin size-5" v-if="loadingSeason" />
				<span>Edit a season</span>
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
				<UFormField label="Season number" name="number" required>
					<UInputNumber
						v-model="state.number"
						class="w-full"
						:min="0"
						:disabled="isLoading"
						:loading="loadingSeason"
					/>
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
			<UButton label="Cancel" variant="ghost" color="neutral" @click="emit('close')" :disabled="isLoading" />
			<UButton label="Update" @click="form?.submit()" :loading="isSubmitting" :disabled="isInitializing" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const props = defineProps<{ id: string }>();
const emit = defineEmits<{ close: [value?: { season: SeasonWithMediaView; collections: CollectionDefaultView[] }] }>();

const trpc = useTrpc();
const toast = useStatusToast();
const form = useTemplateRef("form");
const isSubmitting = ref(false);

const schema = z.object({
	name: ClientMediaValidation.name,
	number: SeasonNumberSchemaBase,
	status: ClientMediaValidation.status,
	collections: z.array(ClientCollectionValidation.id),
	overview: ClientSeasonValidation.overview,
	note: ClientMediaValidation.note,
	rating: ClientMediaValidation.rating,
});
type Schema = z.infer<typeof schema>;

const { data: season, pending: loadingSeason } = useClientAsyncData(() => trpc.season.getById.query({ id: props.id }));
const { data: collections, pending: loadingCollections } = useClientAsyncData(() =>
	trpc.media.getCollections.query({ id: props.id }),
);
const isInitializing = computed(() => loadingSeason.value || loadingCollections.value);
const isLoading = computed(() => isInitializing.value || isSubmitting.value);

const state = reactive<Schema>({
	name: "",
	number: 0,
	status: undefined,
	collections: [],
	overview: "",
	note: "",
	rating: undefined,
});

watch(
	season,
	(value) => {
		if (!value) {
			return;
		}
		state.name = value.media.name ?? `Season ${value.number}`;
		state.number = value.number;
		state.status = value.media.status ?? undefined;
		state.overview = value.overview ?? "";
		state.note = value.media.note ?? "";
		state.rating = value.media.rating ?? undefined;
	},
	{ immediate: true },
);

watch(
	collections,
	(value) => {
		if (value) {
			state.collections = value.map((collection) => collection.id);
		}
	},
	{ immediate: true },
);

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		isSubmitting.value = true;
		const updatedSeason = await trpc.season.update.mutate({
			id: props.id,
			...payload.data,
			status: payload.data.status ?? null,
			overview: payload.data.overview,
			note: payload.data.note,
			rating: payload.data.rating ?? null,
		});
		const updatedCollections = await trpc.media.updateCollections.mutate({
			id: props.id,
			collectionIds: payload.data.collections,
		});
		toast.success({ description: `Season ${updatedSeason.media.name} has been updated` });
		emit("close", { season: updatedSeason, collections: updatedCollections });
	} catch (error) {
		toast.error(error);
	} finally {
		isSubmitting.value = false;
	}
};
</script>
