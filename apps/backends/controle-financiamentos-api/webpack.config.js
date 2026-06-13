const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist-prod'),
    filename: 'main.js',
  },
  resolve: {
    alias: {
      '@prisma/client': join(__dirname, 'src/generated/prisma/client.ts'),
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      outputHashing: 'none',
      optimization: false,
      sourceMap: true,
      generatePackageJson: false,
      externalDependencies: 'all',
    }),
  ],
};
