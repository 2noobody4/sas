/**
 * componentRegistry.ts – PARTIE 2/3
 * Catégories de composants pour l'éditeur de thème
 */

export const COMPONENT_CATEGORIES: Record<string, string[]> = {
  base: [
    'box:default', 'box:primary', 'box:secondary', 'box:success',
    'box:danger', 'box:warning', 'box:info', 'box:dark', 'box:light',
    'box:outlined', 'box:shadow'
  ],
  buttons: [
    'button:primary', 'button:secondary', 'button:success', 'button:danger',
    'button:warning', 'button:info', 'button:outline', 'button:ghost',
    'button:small', 'button:large', 'button:icon', 'button:rounded',
    'button:floating', 'button:link'
  ],
  cards: [
    'card:default', 'card:small', 'card:medium', 'card:large', 'card:xlarge',
    'card:elevated', 'card:outlined', 'card:flat', 'card:glass', 'card:gradient'
  ],
  texts: [
    'text:title', 'text:subtitle', 'text:body', 'text:caption', 'text:label',
    'text:stat', 'text:heading1', 'text:heading2', 'text:heading3', 'text:heading4',
    'text:small', 'text:large', 'text:muted', 'text:bold', 'text:italic',
    'text:underline', 'text:strikethrough', 'text:code', 'text:pre', 'text:quote'
  ],
  inputs: [
    'input:default', 'input:filled', 'input:outlined', 'input:search',
    'input:number', 'input:password', 'input:email', 'input:tel', 'input:url',
    'input:date', 'input:time', 'input:datetime', 'input:file', 'input:range',
    'input:color', 'select:default', 'select:filled', 'select:outlined',
    'select:multiple', 'textarea:default', 'textarea:filled', 'textarea:outlined',
    'checkbox:default', 'checkbox:switch', 'radio:default', 'radio:card'
  ],
  badges: [
    'badge:primary', 'badge:secondary', 'badge:success', 'badge:danger',
    'badge:warning', 'badge:info', 'badge:dark', 'badge:light',
    'badge:outline', 'badge:dot', 'badge:pill', 'badge:status'
  ],
  settings: [
    'settings:card', 'settings:section', 'settings:field',
    'settings:button-primary', 'settings:button-secondary',
    'settings:checkbox', 'settings:radio', 'settings:label',
    'settings:description', 'settings:preview', 'settings:switch',
    'settings:group', 'settings:divider'
  ],
  uploads: [
    'upload:general', 'upload:image', 'upload:video', 'upload:audio',
    'upload:document', 'upload:avatar', 'upload:multiple'
  ],
  layout: [
    'layout:container', 'layout:grid', 'layout:flex', 'layout:sidebar',
    'layout:main', 'layout:header', 'layout:footer', 'layout:row',
    'layout:col', 'layout:section', 'layout:page'
  ],
  navigation: [
    'nav:item', 'nav:dropdown', 'nav:link', 'nav:button', 'nav:icon',
    'nav:label', 'sidebar:item', 'sidebar:section', 'sidebar:header',
    'sidebar:footer', 'breadcrumb:item', 'breadcrumb:separator'
  ],
  notifications: [
    'notification:toast', 'notification:banner', 'notification:alert',
    'notification:badge', 'notification:popup', 'notification:inline',
    'notification:success', 'notification:error', 'notification:warning',
    'notification:info'
  ],
  modals: [
    'modal:default', 'modal:small', 'modal:large', 'modal:fullscreen',
    'modal:confirmation', 'modal:drawer', 'modal:bottom-sheet',
    'modal:center', 'modal:alert'
  ],
  lists: [
    'list:default', 'list:compact', 'list:table', 'list:card', 'list:grid',
    'list:universal', 'list:ordered', 'list:unordered', 'list:description',
    'list:action', 'list:divider'
  ],
  forms: [
    'form:default', 'form:inline', 'form:group', 'form:actions',
    'form:error', 'form:success', 'form:loading', 'form:disabled',
    'form:horizontal', 'form:vertical'
  ],
  stats: [
    'stat:default', 'stat:card', 'stat:number', 'stat:percentage',
    'stat:trend', 'stat:up', 'stat:down', 'stat:neutral'
  ],
  pages: [
    'page:default', 'page:auth', 'page:dashboard', 'page:management',
    'page:error', 'page:empty', 'page:loading', 'page:maintenance'
  ],
  media: [
    'image:thumbnail', 'image:avatar', 'image:cover', 'image:contain',
    'image:rounded', 'image:circle', 'image:responsive',
    'media:video', 'media:audio', 'media:player'
  ],
  loading: [
    'loading:spinner', 'loading:skeleton', 'loading:progress',
    'loading:screen', 'loading:bar', 'loading:dots', 'loading:pulse'
  ],
  clients: [
    'client:search-select', 'client:search-results', 'client:card',
    'client:list-item', 'commande:form', 'commande:detail',
    'commande:list', 'commande:status-badge', 'commande:summary'
  ],
  misc: [
    'divider:default', 'divider:vertical', 'divider:thick', 'divider:light',
    'chip:default', 'chip:selected', 'chip:outline', 'chip:closable',
    'tooltip:default', 'tooltip:top', 'tooltip:bottom', 'tooltip:left',
    'tooltip:right', 'popover:default', 'dropdown:default',
    'tab:default', 'tab:pill', 'tab:underline',
    'accordion:default', 'accordion:item', 'accordion:header', 'accordion:content',
    'stepper:default', 'stepper:item', 'stepper:step',
    'pagination:default', 'pagination:item', 'pagination:active',
    'tag:default', 'tag:primary', 'tag:success', 'tag:danger',
    'tag:warning', 'tag:info', 'tag:closable'
  ],
};
