<template>
	<ColorCard title="Appearance" icon="i-lucide-palette">
		<div class="flex flex-col gap-y-5">
			<SettingsParameterItem title="Theme" description="Choose the theme that best fits your style.">
				<UColorModeSelect @change="onThemeChange()" />
			</SettingsParameterItem>
		</div>
	</ColorCard>
</template>

<script setup lang="ts">
const toast = useStatusToast();

const onThemeChange = () => {
	toast.success({ description: `Theme has been updated` });
};
</script>
