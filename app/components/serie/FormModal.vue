<template>
	<UModal :dismissible="!isLoading" :close="!isLoading">
		<template #title>
			<div class="flex items-center gap-x-2">
				<Spinner class="size-5" v-if="isInitializing" />
				<span>{{ serie ? "Update" : "Create" }} a serie</span>
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
						:loading="loadingSerie"
					/>
				</UFormField>
				<UFormField label="Status" name="status">
					<StatusSelectMenu
						class="w-full"
						v-model="state.status"
						:disabled="isLoading"
						:loading="loadingSerie"
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
						:loading="loadingSerie"
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
						:loading="loadingSerie"
					/>
				</UFormField>
				<UFormField label="Rating" name="rating">
					<ClearableRating v-model="state.rating" :disabled="isLoading" :loading="loadingSerie" />
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton
				:label="props.id ? 'Update' : 'Create'"
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

const props = defineProps<{ id?: string }>();

const emit = defineEmits<{
	close: [value?: { serie: SerieWithMediaView; collections: CollectionDefaultView[] }];
}>();

const isSubmitting = ref(false);
const form = useTemplateRef("form");
const toast = useStatusToast();
const trpc = useTrpc();
const serieStore = useSerieStore();

const isInitializing = computed(() => loadingSerie.value || loadingCollections.value);
const isLoading = computed(() => isInitializing.value || isSubmitting.value);

const schema = z.object({
	name: ClientMediaValidation.name,
	status: ClientMediaValidation.status,
	collections: z.array(ClientCollectionValidation.id),
	overview: ClientSerieValidation.overview,
	note: ClientMediaValidation.note,
	rating: ClientMediaValidation.rating,
});
type Schema = z.infer<typeof schema>;

const { data: serie, pending: loadingSerie } = useClientAsyncData(() => trpc.serie.getById.query({ id: props.id }), {
	enabled: () => !!props.id,
});

watch(
	serie,
	(m) => {
		if (!m) {
			return;
		}
		state.name = m.media.name ?? "";
		state.status = m.media.status ?? undefined;
		state.note = m.media.note ?? "";
		state.overview = m.overview ?? "";
		state.rating = m.media.rating ?? undefined;
	},
	{ immediate: true },
);

const { data: collections, pending: loadingCollections } = useClientAsyncData(
	() => trpc.media.getCollections.query({ id: props.id }),
	{ enabled: () => !!props.id },
);

watch(
	collections,
	(c) => {
		if (!c) {
			return;
		}
		state.collections = c.map((col) => col.id);
	},
	{ immediate: true },
);

const state = reactive<Schema>({
	name: "",
	status: undefined,
	collections: [],
	note: "",
	overview: "",
	rating: undefined,
});

const onCancel = () => {
	emit("close");
};

const onSave = async () => {
	form.value?.submit();
};

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
	try {
		isSubmitting.value = true;
		let updatedSerie;
		if (props.id) {
			updatedSerie = await trpc.serie.update.mutate({
				id: props.id,
				name: payload.data.name,
				overview: payload.data.overview,
				rating: payload.data.rating ?? null,
				note: payload.data.note,
				status: payload.data.status ?? null,
			});
			toast.success({ description: `Serie ${updatedSerie.media.name} has been updated` });
		} else {
			updatedSerie = await serieStore.createSerie({
				name: payload.data.name,
				status: payload.data.status ?? null,
				overview: payload.data.overview,
				note: payload.data.note,
				rating: payload.data.rating ?? null,
			});
			toast.success({ description: `Serie ${updatedSerie.media.name} has been created` });
		}
		const updatedCollections = await trpc.media.updateCollections.mutate({
			id: updatedSerie.id,
			collectionIds: payload.data.collections,
		});
		emit("close", { serie: updatedSerie, collections: updatedCollections });
	} catch (err) {
		toast.error(err);
	} finally {
		isSubmitting.value = false;
	}
};
</script>
