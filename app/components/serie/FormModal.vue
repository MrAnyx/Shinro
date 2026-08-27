<template>
	<UModal :title="`${serie ? 'Update' : 'Create'} a serie`" :dismissible="!isLoading" :close="!isLoading">
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
				<UFormField label="Status" name="status">
					<StatusSelectMenu class="w-full" v-model="state.status" />
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
			<UButton :label="serie ? 'Update' : 'Create'" @click="onSave" :loading="isLoading" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const { serie } = defineProps<{ serie?: SerieWithMediaView }>();

const emit = defineEmits<{
	close: [value?: SerieWithMediaView];
}>();

const isLoading = ref(false);
const form = useTemplateRef("form");
const toast = useStatusToast();
const trpc = useTrpc();
const serieStore = useSerieStore();

const schema = z.object({
	name: ClientMediaValidation.name,
	overview: ClientSerieValidation.overview,
	rating: ClientMediaValidation.rating,
	note: ClientMediaValidation.note,
	status: ClientMediaValidation.status,
});
type Schema = z.infer<typeof schema>;
const state = reactive<Schema>({
	name: serie?.media.name ?? "",
	overview: serie?.overview ?? "",
	rating: serie?.media.rating ?? undefined,
	note: serie?.media.note ?? "",
	status: serie?.media.status ?? undefined,
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

		let updatedSerie;

		if (serie) {
			updatedSerie = await trpc.serie.update.mutate({
				id: serie.id,
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
				overview: payload.data.overview,
				rating: payload.data.rating ?? null,
				note: payload.data.note,
				status: payload.data.status ?? null,
			});
			toast.success({ description: `Serie ${updatedSerie.media.name} has been created` });
		}

		emit("close", updatedSerie);
	} catch (err) {
		toast.error(err);
	} finally {
		isLoading.value = false;
	}
};
</script>
