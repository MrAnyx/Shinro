<template>
	<div>
		<!-- <pre v-if="!error">{{ data }}</pre>

		<p v-if="error">{{ error }}</p>

		<UButton :loading="pending" @click="refresh()">Refresh</UButton> -->
	</div>
</template>

<script lang="ts" setup>
// const trpc = useTrpc();
const log = useLogger("index");

log.trace("test");

// const { data, refresh, pending, error } = useAsyncData("ee", () => trpc.users.login.query({}));
</script>
