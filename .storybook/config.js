/* eslint-disable import/no-extraneous-dependencies */
import { configure, addDecorator, addParameters } from '@storybook/vue'
import directusTheme from "./directusTheme";

// Global styling and vue components
import '../src/globals';
import '../src/design/main.scss';
import './storybook-reset.scss';

// Importing Decorators
import centered from '@storybook/addon-centered/vue';
import { withA11y } from '@storybook/addon-a11y';
import { withKnobs } from '@storybook/addon-knobs';
import { addReadme } from 'storybook-readme/vue';

addDecorator(withKnobs);
addDecorator(centered);
addDecorator(withA11y);
addDecorator(addReadme);

// Option defaults.
addParameters({
  options: {
    theme: directusTheme,
  },
  backgrounds: [
    { name: 'light', value: '#fff', default: true },
    { name: 'gray', value: '#eceff1' },
    { name: 'dark', value: '#263238' },
  ],
});

const req = require.context('../src', true, /.stories.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module);
