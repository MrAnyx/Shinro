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
				<UFormField label="Title" name="title" required>
					<UInput v-model="state.title" class="w-full" :maxlength="255" autofocus />
				</UFormField>
				<UFormField label="Description" name="description">
					<UTextarea v-model="state.description" class="w-full" autoresize :maxrows="10" />
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
import * as z from "zod";

const { movie } = defineProps<{ movie?: MovieDefaultView }>();

const emit = defineEmits<{
	close: [value?: boolean];
}>();

const isLoading = ref(false);
const form = useTemplateRef("form");
const toast = useToast();
const trpc = useTrpc();
const movieStore = useMovieStore();

const schema = z.object({
	title: ClientMovieValidation.title,
	description: ClientMovieValidation.description,
	rating: ClientMovieValidation.rating,
});
type Schema = z.infer<typeof schema>;
const state = reactive<Schema>({
	title: movie?.title ?? "",
	description: movie?.description ?? "",
	rating: movie?.rating ?? undefined,
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

		if (movie) {
			const updatedMovie = await trpc.movies.update.mutate({
				id: movie.id,
				name: payload.data.title,
				overview: payload.data.description,
				rating: payload.data.rating ?? null,
			});
			toast.add({
				title: "Movie updated",
				description: `Movie ${updatedMovie.title} has been updated`,
				color: "success",
				type: "foreground",
			});
		} else {
			const newMovie = await movieStore.createMovie({
				title: payload.data.title,
				description: payload.data.description,
				rating: payload.data.rating ?? null,
			});
			toast.add({
				title: "New movie created",
				description: `Movie ${newMovie.title} has been created`,
				color: "success",
				type: "foreground",
			});
		}

		emit("close", true);
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
