<script setup lang="ts">
// Redirect old movie detail pages to the new unified media detail page
definePageMeta({
	redirect: (to) => {
		return `/app/media/${to.params.type}/${to.params.id}?mediaType=MOVIE`;
	},
});
</script>
