import initStoryshots from '@storybook/addon-storyshots';

initStoryshots({
  // modal components are untested until https://github.com/facebook/react/issues/11565 is fixed
  storyKindRegex: /^((?!.*?Dialog).)*$/,
});
