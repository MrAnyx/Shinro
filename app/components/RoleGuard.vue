<template>
	<slot v-if="allowed" />
</template>

<script setup lang="ts">
import { Role } from "#prisma/enums";

const props = defineProps<{
	allow: Role | Role[];
}>();

// Get the current user — adapt this to however you store auth state
const { user } = useUserStore();

const allowed = computed(() => {
	const roles = Array.isArray(props.allow) ? props.allow : [props.allow];

	if (!user?.role) {
		return false;
	}

	return roles.includes(user?.role);
});
</script>
