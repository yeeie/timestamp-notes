export function pathToFileUri(input: string): string {
  if (!input) return ''
  // already a scheme
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input)) {
    try { return encodeURI(input) } catch { return input }
  }
  // Normalize Windows backslashes to forward
  let p = input.replace(/\\/g, '/')
  // If drive letter like C:/ -> ensure leading /
  if (/^[A-Za-z]:\//.test(p)) {
    p = '/' + p
  }
  // Encode each path segment to preserve slashes
  const parts = p.split('/').map(seg => encodeURIComponent(seg)).join('/')
  return 'file://' + parts
}
