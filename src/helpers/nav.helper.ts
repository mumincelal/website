export const SECTIONS = [
  "Index",
  "Work",
  "About",
  "Path",
  "Open source",
  "Contact"
] as const;

/** URL values for `?section=`, in the same order as SECTIONS. */
export const SECTION_SLUGS = [
  "index",
  "work",
  "about",
  "path",
  "open-source",
  "contact"
] as const;

export const S = {
  index: 0,
  work: 1,
  about: 2,
  path: 3,
  open: 4,
  contact: 5
} as const;

export const wrap = (i: number, n: number) => (i + n) % n;
