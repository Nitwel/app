import { create } from '@storybook/theming';
import '../src/design/_colors.scss';
import '../src/design/_typography.scss';

// This function gets the values of the root css variables
const getVar = style => getComputedStyle(document.documentElement).getPropertyValue(style).trim();

export default create({
  base: 'light',

  colorPrimary: getVar('--gray'),
  colorSecondary: getVar('--dark-gray'),

  // UI
  appBg: getVar('--lightest-gray'),
  appContentBg: 'white',
  // appBorderColor: 'grey',
  // appBorderRadius: 4,

  // Typography
  fontBase: getVar('--family-sans-serif'),
  fontCode: getVar('--family-monospace'),

  // Text colors
  textColor: getVar('--darkest-gray'),
  // textInverseColor: 'rgba(255,255,255,0.9)',

  // Toolbar default and active colors
  barTextColor: getVar('--gray'),
  barSelectedColor: getVar('--dark-gray'),
  barBg: 'white',

  // Form colors
  // inputBg: 'white',
  // inputBorder: 'silver',
  // inputTextColor: 'black',
  // inputBorderRadius: 4,

  brandTitle: 'Directus',
  brandUrl: '/',
  brandImage: 'https://directus.io/img/assets/directus-flat.svg',
});
