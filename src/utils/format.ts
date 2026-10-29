export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = parseDateTime(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function formatSynchronizationDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = parseDateTime(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const formatImportDate = formatSynchronizationDate;

function parseDateTime(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
