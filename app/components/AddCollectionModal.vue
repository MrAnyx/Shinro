<template>
	<UModal :title="`${collection ? 'Update' : 'Create'} a collection`" :dismissible="!isLoading" :close="!isLoading">
		<template #body>
			<UForm ref="form" :schema="schema" :state="state" @submit="onSubmit">
				<UFormField label="Name" name="name">
					<UInput v-model="state.name" class="w-full" />
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

const schema = z.object({
	name: z.string().min(3), // Add a validation schema rule
});
type Schema = z.infer<typeof schema>;
const state = reactive<Schema>({
	name: "",
});

const onCancel = () => {
	emit("close");
};

const onSave = async () => {
	form.value?.submit();
};

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	isLoading.value = true;
	await delay(3000);
	isLoading.value = false;
};
</script>
