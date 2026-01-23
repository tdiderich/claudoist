export const parseTags = (input?: string): string[] => {
  if (!input) {
    return [];
  }
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

export const generateId = (prefix: string, now = new Date()): string => {
  const iso = now.toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${iso}`;
};
