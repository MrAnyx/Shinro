<template>
	<UCard>
		<template #title>
			<div class="flex items-center gap-x-2">
				<UIcon name="i-lucide-palette" class="size-5" />
				<span>Appearance</span>
			</div>
		</template>
		<div class="flex flex-col gap-y-5">
			<div class="flex">
				<div class="w-1/2 shrink-0">
					<h2 class="font-medium">Theme</h2>
					<span class="text-sm text-muted">Choose the theme that best fits your style.</span>
				</div>
				<div class="flex-1 my-auto flex flex-col gap-y-3">
					<UColorModeSelect @change="onThemeChange()" />
				</div>
			</div>
		</div>
	</UCard>
</template>

<script setup lang="ts">
const toast = useStatusToast();

const onThemeChange = () => {
	toast.success({ description: `Theme has been updated` });
};
</script>
