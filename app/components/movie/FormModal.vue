<template>
	<UModal :title="`${movie ? 'Update' : 'Create'} a movie`" :dismissible="!isLoading" :close="!isLoading">
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
					<UInput v-model="state.name" class="w-full" :maxlength="255" autofocus />
				</UFormField>
				<UFormField label="Overview" name="overview">
					<UTextarea v-model="state.overview" class="w-full" autoresize :maxrows="10" />
				</UFormField>
				<UFormField label="Note" name="note">
					<UTextarea v-model="state.note" class="w-full" autoresize :maxrows="4" :maxlength="1000" />
				</UFormField>
				<UFormField label="Rating" name="rating">
					<ClearableRating v-model="state.rating" />
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

const { movie } = defineProps<{ movie?: MovieWithMediaView }>();

const emit = defineEmits<{
	close: [value?: MovieWithMediaView];
}>();

const isLoading = ref(false);
const form = useTemplateRef("form");
const toast = useToast();
const trpc = useTrpc();
const movieStore = useMovieStore();

const schema = z.object({
	name: ClientMediaValidation.name,
	overview: ClientMovieValidation.overview,
	rating: ClientMediaValidation.rating,
	note: ClientMediaValidation.note,
});
type Schema = z.infer<typeof schema>;
const state = reactive<Schema>({
	name: movie?.media.name ?? "",
	overview: movie?.overview ?? "",
	rating: movie?.media.rating ?? undefined,
	note: movie?.media.note ?? "",
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

		if (movie) {
			updatedMovie = await trpc.movie.update.mutate({
				id: movie.id,
				name: payload.data.name,
				overview: payload.data.overview,
				rating: payload.data.rating ?? null,
				note: payload.data.note,
			});
			toast.add({
				title: "Movie updated",
				description: `Movie ${updatedMovie.media.name} has been updated`,
				color: "success",
				type: "foreground",
			});
		} else {
			updatedMovie = await movieStore.createMovie({
				name: payload.data.name,
				overview: payload.data.overview,
				rating: payload.data.rating ?? null,
				note: payload.data.note,
			});
			toast.add({
				title: "New movie created",
				description: `Movie ${updatedMovie.media.name} has been created`,
				color: "success",
				type: "foreground",
			});
		}

		emit("close", updatedMovie);
	} catch (err) {
		const message = isTRPCError(err) ? err.message : "Unknown error";

		toast.add({
			title: "Request failed",
			description: message,
			color: "error",
			type: "foreground",
		});
	} finally {
		isLoading.value = false;
	}
};
</script>
