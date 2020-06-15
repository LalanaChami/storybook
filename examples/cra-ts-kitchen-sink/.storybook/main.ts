// eslint-disable-next-line import/no-extraneous-dependencies
import { Configuration } from 'webpack';

const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.@(mdx|tsx|ts|jsx|js)'],
  logLevel: 'debug',
  addons: [
    {
      name: '@storybook/preset-create-react-app',
      options: {
        tsDocgenLoaderOptions: {
          tsconfigPath: path.resolve(__dirname, '../tsconfig.json'),
          shouldExtractLiteralValuesFromEnum: true,
          propFilter: (prop: any) => {
            // Currently not working, prop.parent is always null.
            if (prop.parent) {
              return !prop.parent.fileName.includes('node_modules/@types/react/');
            }

            return true;
          },
        },
      },
    },
    '@storybook/addon-docs',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
  ],
  webpackFinal: (config: Configuration) => {
    // add monorepo root as a valid directory to import modules from
    config.resolve.plugins.forEach((p) => {
      // @ts-ignore
      if (Array.isArray(p.appSrcs)) {
        // @ts-ignore
        p.appSrcs.push(path.join(__dirname, '..', '..', '..'));
      }
    });
    return config;
  },
};
