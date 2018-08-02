import initStoryshots from '@storybook/addon-storyshots'
import { configure } from '@storybook/react'

const req = require.context('../', true, /__stories__\/.*.js$/)

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module)

initStoryshots()
