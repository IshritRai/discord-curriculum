// Extracts "concept tokens" from code so they can be checked against concepts.json.
//
// A token is a short string such as:
//   html:tag:nav            html:attr:aria-label     html:attrval:type=module
//   css:prop:display        css:value:display=flex   css:pseudo:hover   css:fn:var   css:unit:rem
//   js:syntax:arrow         js:global:document       js:member:querySelector
//   jsx:syntax:element      jsx:attr:className       import:react:useState
//   sh:git commit           json:syntax
//
// JavaScript is parsed with acorn (+ acorn-jsx). Code that doesn't parse on its
// own (a fragment) is retried inside a wrapper, then falls back to a lexical scan.

import * as acorn from 'acorn'
import jsx from 'acorn-jsx'

const JsxParser = acorn.Parser.extend(jsx())

// ---------------------------------------------------------------- languages

const LANG_ALIASES = {
  html: 'html', svg: 'html', xml: 'html', vue: 'html',
  css: 'css',
  js: 'js', javascript: 'js', mjs: 'js',
  jsx: 'jsx',
  json: 'json',
  sh: 'sh', bash: 'sh', zsh: 'sh', shell: 'sh', console: 'sh',
  yaml: 'yaml', yml: 'yaml',
  md: 'md', markdown: 'md',
  gitignore: 'gitignore',
}

export function normalizeLang(lang) {
  return LANG_ALIASES[(lang || '').toLowerCase()] || null
}

export function langForFile(path) {
  if (/\.gitignore$/.test(path)) return 'gitignore'
  const ext = path.split('.').pop().toLowerCase()
  return normalizeLang(ext)
}

// --------------------------------------------------------------------- HTML

const HTML_VALUE_ATTRS = new Set(['type', 'rel', 'method', 'popover'])

export function htmlTokens(code, out) {
  const tokens = out.tokens
  let rest = code
  if (/<!doctype/i.test(rest)) tokens.add('html:doctype')
  // comments
  rest = rest.replace(/<!--([\s\S]*?)-->/g, () => {
    tokens.add('html:comment')
    return ''
  })
  // inline scripts and styles
  rest = rest.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m, attrs, body) => {
    if (body.trim()) jsTokens(body, out, { lang: 'js', sourceType: /type\s*=\s*["']?module/i.test(attrs) ? 'module' : 'script' })
    return `<script${attrs}></script>`
  })
  rest = rest.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (m, attrs, body) => {
    cssTokens(body, out)
    return `<style${attrs}></style>`
  })
  if (/&[a-zA-Z#0-9]+;/.test(rest)) tokens.add('html:entity')
  const tagRe = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g
  let m
  while ((m = tagRe.exec(rest))) {
    const tag = m[1].toLowerCase()
    tokens.add(`html:tag:${tag}`)
    const attrRe = /([^\s"'>\/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
    let a
    while ((a = attrRe.exec(m[2]))) {
      const name = a[1].toLowerCase()
      const value = a[3] ?? a[4] ?? a[5]
      if (name.startsWith('data-')) tokens.add('html:attr:data-*')
      else tokens.add(`html:attr:${name}`)
      if (value !== undefined && HTML_VALUE_ATTRS.has(name)) tokens.add(`html:attrval:${name}=${value.toLowerCase()}`)
      if (name === 'style' && value) cssTokens(`x{${value}}`, out, { inlineStyle: true })
    }
  }
}

// ---------------------------------------------------------------------- CSS

const CSS_VALUE_PROPS = new Set([
  'display', 'position', 'overflow', 'overflow-x', 'overflow-y', 'box-sizing', 'white-space',
  'text-overflow', 'visibility', 'flex-wrap', 'pointer-events', 'user-select', 'flex-direction',
  'scrollbar-width', 'resize', 'text-transform', 'word-break', 'overflow-wrap', 'list-style',
  'cursor', 'font-style',
])
const CSS_KEYWORDS = new Set(['currentcolor', 'inherit', 'initial', 'unset', 'transparent'])
const CSS_UNITS = ['px', 'rem', 'em', '%', 'vh', 'vw', 'dvh', 'svh', 'fr', 's', 'ms', 'deg', 'ch']

function cssSelectorTokens(selector, tokens) {
  let sel = selector.trim()
  if (!sel) return
  if (/^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*$/.test(sel)) return // keyframe selectors
  if (sel.includes(',')) tokens.add('css:selector:list')
  for (const part of sel.split(',')) {
    let s = part.trim()
    // attribute selectors
    s = s.replace(/\[[^\]]*\]/g, () => {
      tokens.add('css:selector:attribute')
      return '[]'
    })
    // functional pseudo-classes: record and analyse their arguments
    s = s.replace(/(::?)([a-zA-Z-]+)\(([^()]*)\)/g, (m, colons, name, inner) => {
      tokens.add(`css:pseudo:${name.toLowerCase()}`)
      if (!/^[\d\sn+-]*$/.test(inner) && !/^(odd|even)$/.test(inner.trim())) cssSelectorTokens(inner, tokens)
      return ':x'
    })
    s = s.replace(/(::?)([a-zA-Z-]+)/g, (m, colons, name) => {
      if (name !== 'x') tokens.add(`css:pseudo:${name.toLowerCase()}`)
      return ''
    })
    if (/\*/.test(s)) tokens.add('css:selector:universal')
    if (/\.[a-zA-Z_-]/.test(s)) tokens.add('css:selector:class')
    if (/#[a-zA-Z_-]/.test(s)) tokens.add('css:selector:id')
    if (/&/.test(s)) tokens.add('css:nesting')
    if (/>/.test(s)) tokens.add('css:combinator:child')
    if (/\+/.test(s)) tokens.add('css:combinator:next-sibling')
    if (/~/.test(s)) tokens.add('css:combinator:sibling')
    // descendant combinator: whitespace between two compound selectors
    const compact = s.replace(/\s*([>+~])\s*/g, '$1').trim()
    if (/\S\s+\S/.test(compact)) tokens.add('css:combinator:descendant')
    // type selectors: an identifier at the start of a compound selector
    for (const compound of compact.split(/[\s>+~]+/)) {
      if (/^[a-zA-Z][a-zA-Z0-9-]*/.test(compound)) tokens.add('css:selector:type')
    }
  }
}

function cssValueTokens(prop, value, tokens) {
  const v = value.trim()
  if (/!important/.test(v)) tokens.add('css:important')
  const fnRe = /([a-zA-Z-]+)\(/g
  let f
  while ((f = fnRe.exec(v))) tokens.add(`css:fn:${f[1].toLowerCase()}`)
  if (/#[0-9a-fA-F]{3,8}\b/.test(v)) tokens.add('css:color:hex')
  const unitRe = /(?:^|[\s(,/+*-])-?(?:\d+\.?\d*|\.\d+)(px|rem|em|%|vh|vw|dvh|svh|fr|s|ms|deg|ch)\b/g
  let u
  while ((u = unitRe.exec(v))) tokens.add(`css:unit:${u[1]}`)
  if (/(?:^|[\s(,/+*-])-?(?:\d+\.?\d*|\.\d+)%/.test(v)) tokens.add('css:unit:%')
  for (const word of v.toLowerCase().split(/[^a-z-]+/)) {
    if (CSS_KEYWORDS.has(word)) tokens.add(`css:keyword:${word}`)
  }
  if (CSS_VALUE_PROPS.has(prop)) {
    const first = v.toLowerCase().split(/\s+/)[0].replace(/[;!].*$/, '')
    if (/^[a-z-]+$/.test(first)) tokens.add(`css:value:${prop}=${first}`)
  }
}

export function cssTokens(code, out, { inlineStyle = false } = {}) {
  const tokens = out.tokens
  const src = code.replace(/\/\*[\s\S]*?\*\//g, (m) => {
    tokens.add('css:comment')
    return ' '
  })
  const stack = [] // 'rule' | 'at:<name>' | 'keyframes'
  let buf = ''
  const declaration = (text) => {
    const t = text.trim()
    if (!t) return
    const i = t.indexOf(':')
    if (i < 0) return
    const prop = t.slice(0, i).trim().toLowerCase()
    const value = t.slice(i + 1)
    if (prop.startsWith('--')) tokens.add('css:custom-prop')
    else if (/^[a-z-]+$/.test(prop)) tokens.add(`css:prop:${prop}`)
    cssValueTokens(prop, value, tokens)
  }
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '{') {
      const prelude = buf.trim()
      buf = ''
      if (prelude.startsWith('@')) {
        const name = /^@([a-zA-Z-]+)/.exec(prelude)[1].toLowerCase()
        tokens.add(`css:at:${name}`)
        cssValueTokens('', prelude.slice(name.length + 1), tokens)
        if (/selector\(/.test(prelude)) tokens.add('css:fn:selector')
        stack.push(name === 'keyframes' ? 'keyframes' : `at:${name}`)
      } else {
        const inKeyframes = stack[stack.length - 1] === 'keyframes'
        if (!inKeyframes && !inlineStyle) cssSelectorTokens(prelude, tokens)
        stack.push('rule')
      }
    } else if (ch === '}') {
      declaration(buf)
      buf = ''
      stack.pop()
    } else if (ch === ';') {
      const text = buf.trim()
      if (text.startsWith('@')) {
        const name = /^@([a-zA-Z-]+)/.exec(text)?.[1]
        if (name) tokens.add(`css:at:${name.toLowerCase()}`)
      } else declaration(text)
      buf = ''
    } else {
      buf += ch
    }
  }
  // a trailing declaration without a semicolon, outside braces (fragment)
  if (buf.includes(':') && !buf.includes('{')) declaration(buf)
}

// ----------------------------------------------------------------------- JS

const JS_KEYWORD_TOKENS = {
  const: 'const', let: 'let', var: 'var', function: 'function', return: 'return', if: 'if',
  else: 'else', for: 'for', while: 'while', break: 'break', continue: 'continue', switch: 'switch',
  new: 'new', class: 'class', import: 'import', export: 'export', try: 'try', catch: 'try',
  throw: 'throw', typeof: 'typeof', null: 'null', this: 'this', delete: 'delete', instanceof: 'instanceof',
}

function parseJs(code, { jsx: allowJsx, sourceType = 'module', onComment }) {
  const Parser = allowJsx ? JsxParser : acorn.Parser
  const opts = {
    onComment,
    ecmaVersion: 'latest',
    sourceType,
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowHashBang: true,
  }
  const attempts = [
    { code, offset: 0 },
    { code: `async function __wrap__() {\n${code}\n}`, offset: 1, wrapped: true },
    { code: `({\n${code}\n})`, offset: 1, wrapped: true },
    { code: `class __Wrap__ {\n${code}\n}`, offset: 1, wrapped: true },
  ]
  if (allowJsx) attempts.push({ code: `const __jsx__ = (<>\n${code}\n</>)`, offset: 1, wrapped: true })
  let firstError
  for (const attempt of attempts) {
    try {
      return { ast: Parser.parse(attempt.code, opts), wrapped: attempt.wrapped }
    } catch (error) {
      firstError ||= error
    }
  }
  return { error: firstError }
}

// Generic AST walk that also understands JSX nodes.
function walk(node, visit, parent = null, key = null) {
  if (!node || typeof node.type !== 'string') return
  visit(node, parent, key)
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'start' || k === 'end') continue
    const child = node[k]
    if (Array.isArray(child)) child.forEach((c) => c && typeof c.type === 'string' && walk(c, visit, node, k))
    else if (child && typeof child.type === 'string') walk(child, visit, node, k)
  }
}

function patternNames(pattern, names) {
  if (!pattern) return
  switch (pattern.type) {
    case 'Identifier': names.add(pattern.name); break
    case 'ObjectPattern': pattern.properties.forEach((p) => patternNames(p.type === 'RestElement' ? p.argument : p.value, names)); break
    case 'ArrayPattern': pattern.elements.forEach((e) => patternNames(e, names)); break
    case 'RestElement': patternNames(pattern.argument, names); break
    case 'AssignmentPattern': patternNames(pattern.left, names); break
  }
}

// Names the course's own code defines: variables, functions, parameters,
// imports, object keys, JSX props. Used to tell "your data" (server.name)
// apart from built-in APIs (element.textContent).
export function declaredNames(code, { jsx: allowJsx = false } = {}) {
  const names = new Set()
  const { ast } = parseJs(code, { jsx: allowJsx })
  if (!ast) {
    // lexical fallback: words followed by ":" or "=" and words after const/let/function
    for (const m of code.matchAll(/\b(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1])
    for (const m of code.matchAll(/([A-Za-z_$][\w$]*)\s*:/g)) names.add(m[1])
    return names
  }
  walk(ast, (node) => {
    switch (node.type) {
      case 'VariableDeclarator': patternNames(node.id, names); break
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        if (node.id) names.add(node.id.name)
        node.params.forEach((p) => patternNames(p, names))
        break
      case 'ClassDeclaration': if (node.id) names.add(node.id.name); break
      case 'CatchClause': patternNames(node.param, names); break
      case 'ImportSpecifier':
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier': names.add(node.local.name); break
      case 'Property':
        if (!node.computed && node.key.type === 'Identifier') names.add(node.key.name)
        if (!node.computed && node.key.type === 'Literal' && typeof node.key.value === 'string') names.add(node.key.value)
        break
      case 'MethodDefinition':
      case 'PropertyDefinition':
        if (node.key.type === 'Identifier') names.add(node.key.name)
        break
      case 'JSXAttribute':
        if (node.name.type === 'JSXIdentifier') names.add(node.name.name)
        break
    }
  })
  return names
}

export function jsonKeys(code) {
  const names = new Set()
  try {
    const visit = (value) => {
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          names.add(k)
          visit(v)
        }
      }
    }
    visit(JSON.parse(code))
  } catch {
    for (const m of code.matchAll(/"([A-Za-z_$][\w$]*)"\s*:/g)) names.add(m[1])
  }
  return names
}

function isReference(node, parent, key) {
  if (!parent) return true
  switch (parent.type) {
    case 'MemberExpression': return key === 'object' || parent.computed
    case 'Property': return key === 'value' || (key === 'key' && parent.computed)
    case 'MethodDefinition':
    case 'PropertyDefinition': return key !== 'key' || parent.computed
    case 'VariableDeclarator': return key === 'init'
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression': return key === 'body'
    case 'ClassDeclaration':
    case 'ClassExpression': return key === 'superClass'
    case 'CatchClause': return key === 'body'
    case 'LabeledStatement':
    case 'BreakStatement':
    case 'ContinueStatement': return false
    case 'ImportSpecifier':
    case 'ImportDefaultSpecifier':
    case 'ImportNamespaceSpecifier':
    case 'ExportSpecifier': return false
    case 'AssignmentPattern': return key === 'right'
    case 'ObjectPattern':
    case 'ArrayPattern':
    case 'RestElement': return false
    default: return true
  }
}

function addPatternSyntax(pattern, tokens) {
  if (!pattern) return
  if (pattern.type === 'ObjectPattern') tokens.add('js:syntax:destructure-object')
  if (pattern.type === 'ArrayPattern') tokens.add('js:syntax:destructure-array')
}

const REACT_SPECIAL_ATTRS = new Set(['className', 'htmlFor', 'key', 'ref', 'style', 'dangerouslySetInnerHTML', 'defaultValue', 'defaultChecked'])

export function jsTokens(code, out, { lang = 'js', sourceType = 'module' } = {}) {
  const tokens = out.tokens
  const allowJsx = lang === 'jsx'
  let comments = 0
  const { ast, error } = parseJs(code, { jsx: allowJsx, sourceType, onComment: () => comments++ })
  if (comments) tokens.add('js:syntax:comment')
  if (!ast) {
    out.warnings.push(`parsed lexically (${error.message})`)
    return jsLexicalTokens(code, out)
  }
  const declared = new Set()
  walk(ast, (node) => {
    if (node.type === 'VariableDeclarator') patternNames(node.id, declared)
    if (/Function/.test(node.type)) {
      if (node.id) declared.add(node.id.name)
      node.params.forEach((p) => patternNames(p, declared))
    }
    if (node.type === 'CatchClause') patternNames(node.param, declared)
    if (/^Import.*Specifier$/.test(node.type)) declared.add(node.local.name)
    if (node.type === 'ClassDeclaration' && node.id) declared.add(node.id.name)
  })

  walk(ast, (node, parent, key) => {
    switch (node.type) {
      case 'VariableDeclaration':
        tokens.add(`js:syntax:${node.kind}`)
        node.declarations.forEach((d) => addPatternSyntax(d.id, tokens))
        break
      case 'FunctionDeclaration':
        if (node.id?.name !== '__wrap__') tokens.add('js:syntax:function')
        if (node.async && node.id?.name !== '__wrap__') tokens.add('js:syntax:async')
        if (node.generator) tokens.add('js:syntax:generator')
        break
      case 'FunctionExpression':
        if (parent?.type !== 'MethodDefinition' && !(parent?.type === 'Property' && parent.method)) tokens.add('js:syntax:function-expression')
        if (node.async) tokens.add('js:syntax:async')
        break
      case 'ArrowFunctionExpression':
        tokens.add('js:syntax:arrow')
        if (node.async) tokens.add('js:syntax:async')
        break
      case 'AssignmentPattern':
        if (parent && /Function/.test(parent.type)) tokens.add('js:syntax:default-param')
        else tokens.add('js:syntax:destructure-default')
        break
      case 'RestElement': tokens.add('js:syntax:rest'); break
      case 'ObjectPattern':
        tokens.add('js:syntax:destructure-object')
        break
      case 'ArrayPattern':
        tokens.add('js:syntax:destructure-array')
        break
      case 'SpreadElement':
        tokens.add(parent?.type === 'ObjectExpression' ? 'js:syntax:spread-object' : 'js:syntax:spread')
        break
      case 'TemplateLiteral':
        if (parent?.type !== 'TaggedTemplateExpression') tokens.add('js:syntax:template-literal')
        break
      case 'TaggedTemplateExpression': tokens.add('js:syntax:tagged-template'); break
      case 'ChainExpression': tokens.add('js:syntax:optional-chaining'); break
      case 'LogicalExpression':
        tokens.add(node.operator === '??' ? 'js:syntax:nullish' : 'js:syntax:logical')
        break
      case 'BinaryExpression': {
        const op = node.operator
        if (op === '===' || op === '!==') tokens.add('js:syntax:strict-equality')
        else if (op === '==' || op === '!=') tokens.add('js:syntax:loose-equality')
        else if (op === '%') tokens.add('js:syntax:remainder')
        else if (op === '**') tokens.add('js:syntax:exponent')
        else if (op === 'in') tokens.add('js:syntax:in')
        else if (op === 'instanceof') tokens.add('js:syntax:instanceof')
        else if (['&', '|', '^', '<<', '>>', '>>>'].includes(op)) tokens.add('js:syntax:bitwise')
        else tokens.add('js:syntax:operators')
        break
      }
      case 'UnaryExpression':
        if (node.operator === 'typeof') tokens.add('js:syntax:typeof')
        else if (node.operator === '!') tokens.add('js:syntax:not')
        else if (node.operator === 'delete') tokens.add('js:syntax:delete')
        else if (node.operator === 'void') tokens.add('js:syntax:void')
        else tokens.add('js:syntax:operators')
        break
      case 'UpdateExpression': tokens.add('js:syntax:increment'); break
      case 'AssignmentExpression':
        if (['??=', '||=', '&&='].includes(node.operator)) tokens.add('js:syntax:logical-assign')
        else if (node.operator !== '=') tokens.add('js:syntax:compound-assign')
        addPatternSyntax(node.left, tokens)
        break
      case 'ConditionalExpression': tokens.add('js:syntax:ternary'); break
      case 'IfStatement':
        tokens.add('js:syntax:if')
        if (node.alternate) tokens.add('js:syntax:else')
        break
      case 'ForOfStatement': tokens.add(node.await ? 'js:syntax:for-await' : 'js:syntax:for-of'); break
      case 'ForInStatement': tokens.add('js:syntax:for-in'); break
      case 'ForStatement': tokens.add('js:syntax:for'); break
      case 'WhileStatement': tokens.add('js:syntax:while'); break
      case 'DoWhileStatement': tokens.add('js:syntax:do-while'); break
      case 'BreakStatement': tokens.add('js:syntax:break'); break
      case 'ContinueStatement': tokens.add('js:syntax:continue'); break
      case 'SwitchStatement': tokens.add('js:syntax:switch'); break
      case 'ReturnStatement': tokens.add('js:syntax:return'); break
      case 'TryStatement':
        tokens.add('js:syntax:try')
        if (node.finalizer) tokens.add('js:syntax:finally')
        if (node.handler && !node.handler.param) tokens.add('js:syntax:optional-catch-binding')
        break
      case 'ThrowStatement': tokens.add('js:syntax:throw'); break
      case 'NewExpression': tokens.add('js:syntax:new'); break
      case 'ClassDeclaration':
      case 'ClassExpression':
        if (node.id?.name !== '__Wrap__') tokens.add('js:syntax:class')
        break
      case 'ThisExpression': tokens.add('js:syntax:this'); break
      case 'AwaitExpression': tokens.add('js:syntax:await'); break
      case 'ImportExpression': tokens.add('js:syntax:dynamic-import'); break
      case 'ImportDeclaration': {
        const source = node.source.value
        const relative = source.startsWith('.') || source.startsWith('/')
        if (relative) {
          if (/\.json$/.test(source)) tokens.add('js:syntax:import-json')
          else if (/\.css$/.test(source)) tokens.add('js:syntax:import-css')
          else if (/\.(svg|png|jpe?g|gif|webp)$/.test(source)) tokens.add('js:syntax:import-asset')
          else tokens.add('js:syntax:import')
          for (const s of node.specifiers) {
            if (s.type === 'ImportDefaultSpecifier' && !/\.(json|svg|png|jpe?g|gif|webp)$/.test(source)) tokens.add('js:syntax:import-default')
            if (s.type === 'ImportNamespaceSpecifier') tokens.add('js:syntax:import-namespace')
          }
          if (!node.specifiers.length && !/\.css$/.test(source)) tokens.add('js:syntax:import-side-effect')
        } else {
          if (/\.css$/.test(source)) tokens.add('js:syntax:import-css')
          else tokens.add('js:syntax:import-package')
          for (const s of node.specifiers) {
            if (s.type === 'ImportSpecifier') tokens.add(`import:${source}:${s.imported.name}`)
            else if (s.type === 'ImportDefaultSpecifier') tokens.add(`import:${source}:default`)
            else tokens.add(`import:${source}:*`)
          }
          if (!node.specifiers.length && !/\.css$/.test(source)) tokens.add(`import:${source}:side-effect`)
        }
        break
      }
      case 'ExportNamedDeclaration': tokens.add('js:syntax:export'); break
      case 'ExportDefaultDeclaration': tokens.add('js:syntax:export-default'); break
      case 'ExportAllDeclaration': tokens.add('js:syntax:export'); break
      case 'Literal':
        if (node.regex) tokens.add('js:syntax:regex')
        if (node.value === null && node.raw === 'null') tokens.add('js:syntax:null')
        if (typeof node.value === 'string' && parent?.type !== 'ImportDeclaration' && key !== 'key') tokens.add('js:syntax:string')
        if (typeof node.value === 'boolean') tokens.add('js:syntax:boolean')
        if (typeof node.value === 'number') tokens.add('js:syntax:number')
        break
      case 'ObjectExpression': tokens.add('js:syntax:object'); break
      case 'Property':
        if (parent?.type === 'ObjectExpression') {
          if (node.shorthand) tokens.add('js:syntax:shorthand-property')
          if (node.computed) tokens.add('js:syntax:computed-key')
          if (node.method) tokens.add('js:syntax:method')
          if (node.kind === 'get' || node.kind === 'set') tokens.add('js:syntax:getter-setter')
        }
        break
      case 'ArrayExpression': tokens.add('js:syntax:array'); break
      case 'CallExpression': tokens.add('js:syntax:call'); break
      case 'MemberExpression':
        if (node.computed) tokens.add('js:syntax:bracket-access')
        // element.dataset.serverId: the last part comes from our own data-server-id attribute
        else if (node.object.type === 'MemberExpression' && !node.object.computed && node.object.property.name === 'dataset') break
        else if (node.property.type === 'Identifier') out.members.add(node.property.name)
        else if (node.property.type === 'PrivateIdentifier') tokens.add('js:syntax:private-field')
        break
      case 'Identifier':
        if (!isReference(node, parent, key)) break
        if (declared.has(node.name)) break
        out.globals.add(node.name)
        break
      case 'JSXElement': tokens.add('jsx:syntax:element'); break
      case 'JSXFragment':
        if (!(parent?.type === 'VariableDeclarator' && parent.id.name === '__jsx__')) tokens.add('jsx:syntax:fragment')
        break
      case 'JSXExpressionContainer':
        if (node.expression.type !== 'JSXEmptyExpression') tokens.add('jsx:syntax:expression')
        else tokens.add('jsx:syntax:comment')
        break
      case 'JSXSpreadAttribute': tokens.add('jsx:syntax:spread-props'); break
      case 'JSXOpeningElement': {
        const name = node.name
        if (name.type === 'JSXIdentifier') {
          if (/^[a-z]/.test(name.name)) {
            tokens.add(`html:tag:${name.name}`)
            for (const attr of node.attributes) {
              if (attr.type !== 'JSXAttribute') continue
              const attrName = attr.name.type === 'JSXIdentifier' ? attr.name.name : `${attr.name.namespace.name}:${attr.name.name.name}`
              if (REACT_SPECIAL_ATTRS.has(attrName) || /^on[A-Z]/.test(attrName) || /[A-Z]/.test(attrName)) tokens.add(`jsx:attr:${attrName}`)
              else if (attrName.startsWith('data-')) tokens.add('html:attr:data-*')
              else tokens.add(`html:attr:${attrName.toLowerCase()}`)
            }
          } else {
            tokens.add('jsx:syntax:component')
            if (!declared.has(name.name)) out.globals.add(name.name)
            for (const attr of node.attributes) {
              if (attr.type !== 'JSXAttribute') continue
              tokens.add('jsx:syntax:props')
              if (attr.name.name === 'key' || attr.name.name === 'ref') tokens.add(`jsx:attr:${attr.name.name}`)
            }
          }
        } else if (name.type === 'JSXMemberExpression') {
          tokens.add('jsx:syntax:component')
          tokens.add('jsx:syntax:member-component')
          out.members.add(name.property.name)
          if (name.object.type === 'JSXIdentifier' && !declared.has(name.object.name)) out.globals.add(name.object.name)
        }
        break
      }
    }
  })
}

function jsLexicalTokens(code, out) {
  const tokens = out.tokens
  let prev = null
  try {
    for (const tok of acorn.tokenizer(code, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true })) {
      const label = tok.type.label
      if (tok.type.keyword && JS_KEYWORD_TOKENS[tok.type.keyword]) tokens.add(`js:syntax:${JS_KEYWORD_TOKENS[tok.type.keyword]}`)
      if (label === '=>') tokens.add('js:syntax:arrow')
      if (label === '?.') tokens.add('js:syntax:optional-chaining')
      if (label === '??') tokens.add('js:syntax:nullish')
      if (label === '...') tokens.add('js:syntax:spread')
      if (label === '`') tokens.add('js:syntax:template-literal')
      if (label === '==/!=/===/!==') tokens.add(tok.value.length === 3 ? 'js:syntax:strict-equality' : 'js:syntax:loose-equality')
      if (label === '||' || label === '&&') tokens.add('js:syntax:logical')
      if (label === '?') tokens.add('js:syntax:ternary')
      if (label === '++/--') tokens.add('js:syntax:increment')
      if (label === '_=' && tok.value !== '=') tokens.add('js:syntax:compound-assign')
      if (label === 'regexp') tokens.add('js:syntax:regex')
      if (label === 'name') {
        if (prev && prev.type.label === '.') out.members.add(tok.value)
        else if (tok.value === 'async') tokens.add('js:syntax:async')
        else if (tok.value === 'await') tokens.add('js:syntax:await')
        else if (tok.value === 'of') tokens.add('js:syntax:for-of')
        else out.lexicalNames.add(tok.value)
      }
      prev = tok
    }
  } catch (error) {
    out.warnings.push(`lexical scan stopped: ${error.message}`)
  }
}

// -------------------------------------------------------------------- shell

const SUBCOMMAND_TOOLS = new Set(['git', 'npm', 'npx', 'gh', 'brew', 'node', 'pnpm', 'yarn'])

export function shTokens(code, out) {
  for (let line of code.split('\n')) {
    line = line.trim().replace(/^\$\s+/, '')
    if (!line || line.startsWith('#')) continue
    for (const part of line.split(/&&|\|\||;|\|/)) {
      const words = part.trim().split(/\s+/).filter(Boolean)
      if (!words.length) continue
      const cmd = words[0]
      if (SUBCOMMAND_TOOLS.has(cmd)) {
        const sub = words.slice(1).find((w) => !w.startsWith('-'))
        out.tokens.add(sub && !/^["'.\/]/.test(sub) ? `sh:${cmd} ${sub}` : `sh:${cmd}`)
      } else {
        out.tokens.add(`sh:${cmd}`)
      }
    }
  }
}

// --------------------------------------------------------------------- main

export function newResult() {
  return { tokens: new Set(), members: new Set(), globals: new Set(), lexicalNames: new Set(), warnings: [] }
}

export function extract(code, lang, out = newResult()) {
  switch (lang) {
    case 'html': htmlTokens(code, out); break
    case 'css': cssTokens(code, out); break
    case 'js': jsTokens(code, out, { lang: 'js' }); break
    case 'jsx': jsTokens(code, out, { lang: 'jsx' }); break
    case 'json': out.tokens.add('json:syntax'); break
    case 'sh': shTokens(code, out); break
    case 'yaml': out.tokens.add('yaml:syntax'); break
    case 'md': out.tokens.add('md:syntax'); break
    case 'gitignore': out.tokens.add('git:gitignore'); break
  }
  return out
}
