<template>
	<UModal :title="`${collection ? 'Update' : 'Create'} a collection`" :dismissible="!isLoading" :close="!isLoading">
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
					<UInput v-model="state.name" class="w-full" :maxlength="255" autofocus />
				</UFormField>
				<UFormField label="Description" name="description">
					<UInput v-model="state.description" class="w-full" :maxlength="500" />
				</UFormField>
				<UFormField label="Favorite" name="favorite">
					<USwitch v-model="state.favorite" />
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton :label="collection ? 'Update' : 'Create'" @click="onSave" :loading="isLoading" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

const { collection } = defineProps<{ collection?: CollectionDefaultView }>();

const emit = defineEmits<{
	close: [value?: CollectionDefaultView];
}>();

const isLoading = ref(false);
const form = useTemplateRef("form");
const toast = useStatusToast();
const trpc = useTrpc();
const collectionStore = useCollectionStore();

const schema = z.object({
	name: ClientCollectionValidation.name,
	description: ClientCollectionValidation.description,
	favorite: ClientCollectionValidation.favorite,
});
type Schema = z.infer<typeof schema>;
const state = reactive<Schema>({
	name: collection?.name ?? "",
	description: collection?.description ?? "",
	favorite: collection?.favorite ?? false,
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

		let updatedCollection;

		if (collection) {
			updatedCollection = await trpc.collection.update.mutate({
				id: collection.id,
				name: payload.data.name,
				description: payload.data.description,
				favorite: payload.data.favorite,
			});
			toast.success({ description: `Collection ${updatedCollection.name} has been updated` });
		} else {
			updatedCollection = await collectionStore.createCollection(payload.data);
			toast.success({ description: `Collection ${updatedCollection.name} has been created` });
		}

		emit("close", updatedCollection);
	} catch (err) {
		toast.error(ErrorEvent);
	} finally {
		isLoading.value = false;
	}
};
</script>
