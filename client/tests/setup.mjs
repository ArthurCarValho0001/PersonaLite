import { register } from 'node:module'
import { JSDOM } from 'jsdom'
import 'fake-indexeddb/auto'
import React from 'react'

register('./css-loader.mjs', import.meta.url)
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:5173' })
for (const name of ['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'HTMLElement', 'HTMLInputElement', 'MutationObserver', 'StorageEvent', 'Event']) {
  Object.defineProperty(globalThis, name, { configurable: true, value: dom.window[name] })
}
globalThis.__APP_VERSION__ = 'test'
// Os testes existentes de Aprender exercitam o caminho HTTP; o protótipo tem testes próprios.
globalThis.__APRENDER_API__ = true
globalThis.React = React
globalThis.IS_REACT_ACT_ENVIRONMENT = true
window.confirm = () => true
globalThis.confirm = window.confirm
