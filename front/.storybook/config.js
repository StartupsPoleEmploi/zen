// fix from https://github.com/storybookjs/storybook/issues/2487
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
registerRequireContextHook();
import { configure } from '@storybook/react';

const req = global.__requireContext(__dirname, '../src/components', true, /__stories__\/.*.js$/);


function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module)
