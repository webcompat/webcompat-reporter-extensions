export function isReportableURL(url) {
  if (!url) {
    return false;
  }

  let protocol = new URL(url).protocol;
  return ["http:", "https:"].includes(protocol);
}
