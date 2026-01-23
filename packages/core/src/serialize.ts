const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object") {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
};

const sortObjectKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }
  if (!isPlainObject(value)) {
    return value;
  }

  const ordered: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    ordered[key] = sortObjectKeys(value[key]);
  }
  return ordered;
};

export const stableStringify = (value: unknown, indent = 2): string => {
  const ordered = sortObjectKeys(value);
  return `${JSON.stringify(ordered, null, indent)}\n`;
};
