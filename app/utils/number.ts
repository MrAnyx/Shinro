export const formatNumber = (value: number, opts: Intl.NumberFormatOptions) => {
	return new Intl.NumberFormat(undefined, opts).format(value);
};
