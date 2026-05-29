<template>
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6">
		<!-- Your SVG Logo -->
		<div class="flex flex-row items-center gap-x-1 text-highlighted">
			<img src="~/assets/images/icone.svg" class="size-24" />
			<span class="font-brand text-6xl">Shinro</span>
		</div>

		<!-- Spinner -->
		<UProgress animation="swing" class="w-50" size="sm" />
	</div>
</template>
