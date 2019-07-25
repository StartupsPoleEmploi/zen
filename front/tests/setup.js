/* eslint-disable no-undef */
import registerRequireContextHook from 'babel-plugin-require-context-hook/register'

registerRequireContextHook()

window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }
})
