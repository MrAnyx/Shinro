export const capitalize = (val: string) => {
	return String(val).charAt(0).toLocaleUpperCase() + String(val).slice(1).toLocaleLowerCase();
};
