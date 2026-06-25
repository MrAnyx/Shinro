<template>
	<UModal :title="`${collection ? 'Update' : 'Create'} a collection`" :dismissible="!isLoading" :close="!isLoading">
		<template #body>
			<UForm ref="form" :schema="schema" :state="state" @submit="onSubmit" :validate-on="['change']" class="gap-4 flex flex-col">
				<UFormField label="Name" name="name">
					<UInput v-model="state.name" class="w-full" />
				</UFormField>
				<UFormField label="Description" name="description">
					<UInput v-model="state.description" class="w-full" />
				</UFormField>
				<UFormField name="multiple">
					<UCheckbox label="Create multiple?" v-model="state.multiple" />
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<UButton label="Cancel" variant="ghost" color="neutral" @click="onCancel" :disabled="isLoading" />
			<UButton label="Create" @click="onSave" :loading="isLoading" />
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const { collection } = defineProps<{ collection?: Collection }>();

const emit = defineEmits<{
	close: [value?: Collection];
}>();

const isLoading = ref(false);
const form = useTemplateRef("form");
const toast = useToast();
const collectionStore = useCollectionStore();

const schema = z.object({
	name: CollectionSchema.validation.name,
	description: CollectionSchema.validation.description,
	multiple: z.boolean(),
});
type Schema = z.infer<typeof schema>;
const state = reactive<Schema>({
	name: collection?.name ?? "",
	description: collection?.description ?? undefined,
	multiple: false,
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
		console.log(payload.data);
		const newCollection = await collectionStore.addCollection(payload.data);
		toast.add({
			title: "New collection created",
			description: `Collection ${newCollection.name} has been created`,
			color: "success",
			type: "foreground",
		});

		if (payload.data.multiple) {
			state.name = "";
		} else {
			emit("close", newCollection);
		}
	} catch (err) {
		const message = isTRPCError(err) ? err.message : "Unknown error";

		toast.add({
			title: "Creation failed",
			description: message,
			color: "error",
			type: "foreground",
		});
	} finally {
		isLoading.value = false;
	}
};
</script>
