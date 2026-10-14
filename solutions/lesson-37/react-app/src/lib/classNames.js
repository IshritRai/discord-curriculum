// classNames('message', isEditing && 'is-editing') → "message is-editing" or "message"
// (false, null and undefined are left out)
export function classNames(...names) {
  return names.filter(Boolean).join(' ');
}
