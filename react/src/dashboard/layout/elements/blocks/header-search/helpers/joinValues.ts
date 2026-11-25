export const joinValues = (values: Array<string | number | null | undefined>) => {
    return values.filter((value) => value !== null && value !== undefined && value !== '').join(', ') || null;
};
