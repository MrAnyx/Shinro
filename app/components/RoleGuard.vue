<template>
	<slot v-if="allowed" />
</template>

<script setup lang="ts">
import { Role } from "#prisma/enums";

const props = defineProps<{
	allow: Role | Role[];
}>();

const userStore = useUserStore();

const allowed = computed(() => userStore.isAllowed(props.allow));
</script>
