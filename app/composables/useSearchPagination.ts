export const useSearchPagination = () => {
	const route = useRoute();
	const router = useRouter();

	const search = computed({
		get: () => (route.query.search as string) ?? "",
		set: (val) => router.replace({ query: { ...route.query, search: val, page: 1 } }),
	});

	const page = computed({
		get: () => Number(route.query.page ?? 1),
		set: (val) => router.replace({ query: { ...route.query, page: val } }),
	});

	return {
		search,
		page,
	};
};
