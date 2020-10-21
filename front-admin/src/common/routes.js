// @flow

// URLS
// eslint-disable-next-line import/prefer-default-export
export const URLS: Object = {
  BASE: '/',
  DASHBOARD: '/',
  DECLARATIONS: {
    BASE: '/declarations',
    VIEW: '/declarations/view/:id',
  },
  ACTIVITIES: '/activities',
  SETTINGS: '/settings',
  USERS: {
    BASE: '/users',
    VIEW: '/users/view/:id',
  },
  USERADMINS: {
    BASE: '/useradmins',
    VIEW: '/useradmins/view/:id',
    EDIT: '/useradmins/edit/:id',
    ADD: '/useradmins/add',
  },
};

const formatUrl = (url: string, id: *) => url
  .replace(/[/]{2,10}/g, '/') // replave "//" by /
  .replace(':id', id);
const urlsKeysAddEdit = ['USERS', 'DECLARATIONS', 'USERADMINS'];
urlsKeysAddEdit.forEach((e) => {
  URLS[e].add = () => formatUrl(`${URLS[e].ADD}`, '');
  URLS[e].edit = (id) => formatUrl(`${URLS[e].EDIT}`, id);
  URLS[e].view = (id) => formatUrl(`${URLS[e].VIEW}`, id);
});

export const MENU_ITEMS = [
  {
    name: 'Tableau de bord',
    iconName: 'appstore',
    to: URLS.DASHBOARD,
    key: 'DASHBOARD',
    access: ['admin', 'viewer'],
  },
  {
    name: 'Déclarations',
    iconName: 'shop',
    to: URLS.DECLARATIONS.BASE,
    key: 'DECLARATIONS',
    match: (pathname) => pathname.startsWith(URLS.DECLARATIONS.BASE),
    access: ['admin', 'viewer'],
  },
  {
    name: 'Activités',
    iconName: 'robot',
    to: URLS.ACTIVITIES,
    key: 'ACTIVITIES',
    access: ['admin', 'viewer'],
  },
  {
    name: 'Utilisateurs',
    iconName: 'team',
    to: URLS.USERS.BASE,
    key: 'users',
    match: (pathname) => pathname.startsWith(URLS.USERS.BASE),
    access: ['admin', 'viewer'],
  },
  {
    name: 'Utilisateurs admin',
    iconName: 'team',
    to: URLS.USERADMINS.BASE,
    key: 'useradmins',
    match: (pathname) => pathname.startsWith(URLS.USERADMINS.BASE),
    access: ['admin'],
  },
  {
    name: 'Système',
    iconName: 'setting',
    to: URLS.SETTINGS,
    key: 'SETTINGS',
    access: ['admin'],
  },
];
