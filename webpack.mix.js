const mix = require('laravel-mix');
const webpack = require('webpack');

mix.js('resources/js/app.js', 'public/js')
   .vue()
   .postCss('resources/css/app.css', 'public/css', [
       require('postcss-import'),
       require('tailwindcss'),
   ]).webpackConfig({
      plugins: [
          new webpack.EnvironmentPlugin(require('dotenv').config().parsed)
      ]
  });

if (mix.inProduction()) {
   mix.version();
}


console.log('Environment variables:', require('dotenv').config().parsed);
