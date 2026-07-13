<template>
	<UModal :title="`${collection ? 'Update' : 'Create'} a collection`" :dismissible="!isLoading" :close="!isLoading">
		<template #body>
			<UForm ref="form" :schema="schema" :state="state" @submit="onSubmit" :validate-on="['change']" class="gap-4 flex flex-col">
				<UFormField label="Name" name="name">
					<UInput v-model="state.name" class="w-full" :maxlength="255" autofocus />
				</UFormField>
				<UFormField label="Description" name="description">
					<UInput v-model="state.description" class="w-full" :maxlength="500" />
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
import * as z from "zod";

const { collection } = defineProps<{ collection?: PureCollection }>();

const emit = defineEmits<{
	close: [value?: boolean];
}>();

const isLoading = ref(false);
const form = useTemplateRef("form");
const toast = useToast();
const collectionStore = useCollectionStore();

const schema = z.object({
	name: CollectionValidation.name,
	description: CollectionValidation.description,
});
type Schema = z.infer<typeof schema>;
const state = reactive<Schema>({
	name: collection?.name ?? "",
	description: collection?.description ?? undefined,
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

		if (collection) {
			const updatedCollection = await collectionStore.updateCollection(collection.id, payload.data);
			toast.add({
				title: "Collection updated",
				description: `Collection ${updatedCollection.name} has been updated`,
				color: "success",
				type: "foreground",
			});
		} else {
			const newCollection = await collectionStore.addCollection(payload.data);
			toast.add({
				title: "New collection created",
				description: `Collection ${newCollection.name} has been created`,
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
