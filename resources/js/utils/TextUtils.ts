export const renderOption = (option: string | number) => {
    if (typeof option == 'string') {
        return option;
    }
    return option < 10 ? `0${option}` : `${option}`;
};
