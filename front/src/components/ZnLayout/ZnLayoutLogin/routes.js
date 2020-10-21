export const STEPPER_ROUTES = [
  '/actu',
  '/employers',
  '/files',
  '/dashboard',
  '/history',
  '/cgu',
  '/email-subscribing/.*',
];

const routesWithDisplayedNav = STEPPER_ROUTES.concat('/thanks');

export function isNavigationVisible(pathname) {
  return routesWithDisplayedNav.some((e) => new RegExp(e).test(pathname));
}
