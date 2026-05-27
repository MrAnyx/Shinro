<template>
	<UDashboardPanel id="index">
		<template #header>
			<UDashboardNavbar title="Home">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>
		</template>
		<template #body>
			<VisSingleContainer :data="data">
				<VisTooltip :triggers="triggers" />
				<VisDonut :value="value" />
			</VisSingleContainer>
		</template>
	</UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "main",
});

import { Donut } from "@unovis/ts";
import { VisSingleContainer, VisTooltip, VisDonut } from "@unovis/vue";

const data = [1, 2, 3, 4];
const triggers = { [Donut.selectors.segment]: (d: any) => d.data };
const value = (d: number) => d;
</script>
