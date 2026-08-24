<script setup lang="ts">
// Redirect old serie detail pages to the new unified media detail page
definePageMeta({
	redirect: (to) => {
		return `/app/media/${to.params.type}/${to.params.id}?mediaType=SERIE`;
	},
});
</script>
