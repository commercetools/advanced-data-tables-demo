import { configure } from '@kadira/storybook';

function loadStories() {
  require('../src/stories/full-example');
}

configure(loadStories, module);
