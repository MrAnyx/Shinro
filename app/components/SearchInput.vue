<template>
	<UInput ref="uInputRef" v-model="search" placeholder="Search..." leading-icon="i-lucide-search">
		<template v-if="length > 0" #trailing>
			<UButton color="neutral" variant="link" size="sm" icon="i-lucide-x" @click="resetSearchField" />
		</template>
	</UInput>
</template>

<script setup lang="ts">
const search = defineModel<string>();
const uInputRef = useTemplateRef("uInputRef");

defineExpose({
	inputRef: computed(() => uInputRef.value?.inputRef),
});

const length = computed(() => search.value?.length ?? 0);

const resetSearchField = () => {
	search.value = undefined;
};
</script>
