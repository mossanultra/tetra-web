
const getFormValue = (value: FormDataEntryValue | null): string | null => {
  if (!value || value === 'undefined' || value === 'null') {
    return null;
  }
  if (typeof value === 'string') {
    return value.trim() === '' ? null : value;
  }
  return null;
};
export { getFormValue };