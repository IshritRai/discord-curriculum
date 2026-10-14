// Turns a ledger token such as "css:prop:display" into something readable.
export function tokenLabel(token) {
  const [kind, type, ...rest] = token.split(':')
  const value = rest.join(':')
  if (kind === 'html') {
    if (type === 'tag') return `<${value}>`
    if (type === 'attr') return `${value}=""`
    if (type === 'attrval') return value.replace('=', '="') + '"'
    return value || type
  }
  if (kind === 'css') {
    if (type === 'prop') return `${value}:`
    if (type === 'value') return value.replace('=', ': ')
    if (type === 'fn') return `${value}()`
    if (type === 'at') return `@${value}`
    if (type === 'pseudo') return value.startsWith(':') ? value : `:${value}`
    if (type === 'unit') return value
    return value || type
  }
  if (kind === 'js') {
    if (type === 'member') return `.${value}`
    if (type === 'global') return value
    if (type === 'new') return `new ${value}()`
    if (type === 'syntax') return value
    return value || type
  }
  if (kind === 'jsx') return value || type
  if (kind === 'import') return `${value} from "${type}"`
  if (kind === 'sh') return type
  return token
}
