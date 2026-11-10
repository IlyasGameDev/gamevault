import { decodeHTML } from 'entities';

// Legacy imports may contain both escaped markup and double-encoded entity names.
export function gameText(value: string) {
  return decodeHTML(decodeHTML(value))
    .replace(/<br\s*\/?>|<\/(?:p|div|li)>/gi, '\n')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}
