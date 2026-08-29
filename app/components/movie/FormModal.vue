<template>
	<UModal :title="`${movie ? 'Update' : 'Create'} a movie`" :dismissible="!internalLoading" :close="!internalLoading">
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
					<UInput v-model="state.name" class="w-full" :maxlength="255" autofocus :loading="loadingMovie" />
				</UFormField>
				<UFormField label="Status" name="status">
					<StatusSelectMenu class="w-full" v-model="state.status" :loading="loadingMovie" />
				</UFormField>
				<UFormField label="Collections" name="collections">
					<CollectionSelectMenu class="w-full" v-model="state.collections" :loading="loadingCollections" />
				</UFormField>
				<UFormField label="Overview" name="overview">
					<UTextarea
						v-model="state.overview"
						class="w-full"
						autoresize
						:maxrows="10"
						:loading="loadingMovie"
					/>
				</UFormField>
				<UFormField label="Note" name="note">
					<UTextarea
						v-model="state.note"
						class="w-full"
						autoresize
						:maxrows="4"
						:maxlength="1000"
						:loading="loadingMovie"
					/>
				</UFormField>
				<UFormField label="Rating" name="rating">
					<ClearableRating v-model="state.rating" :loading="loadingMovie" />
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton :label="movie ? 'Update' : 'Create'" @click="onSave" :loading="isLoading" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const props = defineProps<{ id?: string }>();

const emit = defineEmits<{
	close: [value?: { movie: MovieWithMediaView; collections: CollectionDefaultView[] }];
}>();

const isLoading = ref(false);
const form = useTemplateRef("form");
const toast = useStatusToast();
const trpc = useTrpc();
const movieStore = useMovieStore();

const internalLoading = computed(() => isLoading.value || loadingMovie.value || loadingCollections.value);

const schema = z.object({
	name: ClientMediaValidation.name,
	status: ClientMediaValidation.status,
	collections: z.array(ClientCollectionValidation.id),
	overview: ClientMovieValidation.overview,
	note: ClientMediaValidation.note,
	rating: ClientMediaValidation.rating,
});
type Schema = z.infer<typeof schema>;

const { data: movie, pending: loadingMovie } = useSafeAsyncData(() => trpc.movie.getById.query({ id: props.id }), {
	enabled: () => !!props.id,
});

watch(
	movie,
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

const { data: collections, pending: loadingCollections } = useSafeAsyncData(
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
		isLoading.value = true;

		let updatedMovie;

		if (props.id) {
			updatedMovie = await trpc.movie.update.mutate({
				id: props.id,
				name: payload.data.name,
				overview: payload.data.overview,
				rating: payload.data.rating ?? null,
				note: payload.data.note,
				status: payload.data.status ?? null,
			});
			toast.success({ description: `Movie ${updatedMovie.media.name} has been updated` });
		} else {
			updatedMovie = await movieStore.createMovie({
				name: payload.data.name,
				overview: payload.data.overview,
				rating: payload.data.rating ?? null,
				note: payload.data.note,
				status: payload.data.status ?? null,
			});
			toast.success({ description: `Movie ${updatedMovie.media.name} has been created` });
		}

		const updatedCollections = await trpc.media.updateCollections.mutate({
			id: updatedMovie.id,
			collectionIds: payload.data.collections,
		});

		emit("close", { movie: updatedMovie, collections: updatedCollections });
	} catch (err) {
		toast.error(err);
	} finally {
		isLoading.value = false;
	}
};
</script>
