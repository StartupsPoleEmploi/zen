// @flow

// URLS
// eslint-disable-next-line import/prefer-default-export
export const URLS: Object = {
  BASE: '/',
  DASHBOARD: '/',
  ACTUALISATIONS: '/actualisations',
  ACTIVITIES: '/activities',
  SETTINGS: '/settings',
  UTILISATEURS: {
    BASE: '/utilisateurs',
    ADD: '/add',
    VIEW: '/view/:id',
  },
};
const formatUrl = (url: string, id: *) => url
  .replace(/[/]{2,10}/g, '/') // replave "//" by /
  .replace(':id', id);
const urlsKeysAddEdit = ['UTILISATEURS'];
urlsKeysAddEdit.forEach((e) => {
  URLS[e].add = () => formatUrl(`${URLS[e].BASE}/${URLS[e].ADD}`, '');
  URLS[e].edit = (id) => formatUrl(`${URLS[e].BASE}/${URLS[e].EDIT}`, id);
  URLS[e].view = (id) => formatUrl(`${URLS[e].BASE}/${URLS[e].VIEW}`, id);
});

export const MENU_ITEMS = [
  {
    name: 'Dashbord',
    iconName: 'appstore',
    to: URLS.DASHBOARD,
    key: 'DASHBOARD',
  },
  {
    name: 'Actualisations',
    iconName: 'shop',
    to: URLS.ACTUALISATIONS,
    key: 'ACTUALISATIONS',
  },
  {
    name: 'Activités',
    iconName: 'robot',
    to: URLS.ACTIVITIES,
    key: 'ACTIVITIES',
  },
  {
    name: 'Utilisateurs',
    iconName: 'team',
    to: URLS.UTILISATEURS.BASE,
    key: 'users',
    match: (pathname) => pathname.startsWith(URLS.UTILISATEURS.BASE),
  },
  {
    name: 'Systèmes',
    iconName: 'setting',
    to: URLS.SETTINGS,
    key: 'SETTINGS',
  },
];
