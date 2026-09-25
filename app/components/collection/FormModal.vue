<template>
	<UModal :dismissible="!isLoading" :close="!isLoading">
		<template #title>
			<div class="flex items-center gap-x-2">
				<Spinner class="size-5" v-if="isInitializing" />
				<span>{{ props.id ? "Update" : "Create" }} a collection</span>
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
				<UFormField label="Name" name="name" required>
					<UInput
						v-model="state.name"
						class="w-full"
						:maxlength="255"
						autofocus
						:disabled="isLoading"
						:loading="loadingCollection"
					/>
				</UFormField>
				<UFormField label="Description" name="description">
					<UInput
						v-model="state.description"
						class="w-full"
						:maxlength="500"
						:disabled="isLoading"
						:loading="loadingCollection"
					/>
				</UFormField>
				<UFormField label="Favorite" name="favorite">
					<USwitch v-model="state.favorite" :disabled="isLoading" :loading="loadingCollection" />
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton
				:label="collection ? 'Update' : 'Create'"
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
	close: [value?: CollectionDefaultView];
}>();

const isSubmitting = ref(false);
const form = useTemplateRef("form");
const toast = useStatusToast();
const trpc = useTrpc();
const collectionStore = useCollectionStore();

const isInitializing = computed(() => loadingCollection.value);
const isLoading = computed(() => isInitializing.value || isSubmitting.value);

const schema = z.object({
	name: ClientCollectionValidation.name,
	description: ClientCollectionValidation.description,
	favorite: ClientCollectionValidation.favorite,
});
type Schema = z.infer<typeof schema>;

const state = reactive<Schema>({
	name: "",
	description: "",
	favorite: false,
});

const { data: collection, pending: loadingCollection } = useClientAsyncData(
	() => trpc.collection.getById.query({ id: props.id! }),
	{
		enabled: () => !!props.id,
	},
);

watch(collection, (c) => {
	if (!c) {
		return;
	}
	state.name = c.name;
	state.description = c.description ?? "";
	state.favorite = c.favorite;
});

const onCancel = () => {
	emit("close");
};

const onSave = async () => {
	form.value?.submit();
};

const onSubmit = async (payload: FormSubmitEvent<Schema>) =>
	toast.withErrorToast(async () => {
		try {
			isSubmitting.value = true;

			let updatedCollection;

			if (props.id) {
				updatedCollection = await trpc.collection.update.mutate({
					id: props.id,
					name: payload.data.name,
					description: payload.data.description,
					favorite: payload.data.favorite,
				});
			} else {
				updatedCollection = await collectionStore.createCollection({
					name: payload.data.name,
					description: payload.data.description,
					favorite: payload.data.favorite,
				});
			}

			emit("close", updatedCollection);
		} finally {
			isSubmitting.value = false;
		}
	});
</script>
