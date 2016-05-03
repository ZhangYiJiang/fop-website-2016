"use strict";

let path = require('path');

let gulp = require('gulp');
let preservetime = require('gulp-preservetime');
let gulpif = require('gulp-if');
let sass = require('gulp-sass');
let jade = require('gulp-jade');
let newer = require('gulp-newer');
let sourcemaps = require('gulp-sourcemaps');

let browserSync = require('browser-sync');
let _ = require('lodash');
let reload = browserSync.reload;
let argv = require('yargs').argv;

let config = require('./config.json');
let defaults = {
  minify: false,
  sourcemaps: true,
  reload: true,
  urlRewrite: false,
};

let env = _.merge(defaults, config.environments[config.env]);


let jadeUtils = {
  slugify: (str) => {
    return str.toLowerCase()
      .replace(/[^\w\d]+/g, '-');
  }, 
  
  url: (path) => {
    if (!env.urlRewrite)
      path += '.html';
    
    return env.locals.baseUrl + path; 
  }
};


function copyAssets(dest) {
  let assets = ['js', 'img', 'fonts']; 
  
  _.each(assets, (name) => {
    gulp.src(config.paths[name] + '**')
      .pipe(newer(dest + name))
      .pipe(gulp.dest(dest + name))
      .pipe(preservetime());
  });
  
  gulp.src(config.paths.etc + 'favicon.ico')
    .pipe(newer(dest))
    .pipe(gulp.dest(dest))
    .pipe(preservetime());
}

function buildSass(out, minify, reloadBS, useSourcemap) {
  let outputStyle = minify ? 'compressed' : 'nested';
  
  gulp.src(config.paths.styles + 'app.scss')
    .pipe(gulpif(useSourcemap, sourcemaps.init()))
    .pipe(sass({ outputStyle }).on('error', sass.logError))
    .pipe(gulpif(useSourcemap, sourcemaps.write('.')))
    .pipe(gulp.dest(out + 'css'))
    // .pipe(preservetime())
    .pipe(gulpif(reloadBS, reload({ stream: true })));
}

function buildTemplates(locals, env, path) {
  gulp.src(config.paths.templates + 'pages/*.jade')
    .pipe(jade({
      locals: _.merge(locals, jadeUtils, { env }),
      pretty: '\t',
    }))
    .pipe(gulp.dest(path))
    .pipe(preservetime());
}

gulp.task('templates', () => buildTemplates(env.locals, env, env.output));
gulp.task('sass', () => buildSass(env.output, env.minify, env.reload, env.sourcemaps));
gulp.task('assets', () => copyAssets(env.output));

gulp.task('templates-watch', ['templates'], () => setTimeout(reload, 200));
gulp.task('assets-watch', ['assets'], () => setTimeout(reload, 200));

gulp.task('serve', ['sass', 'templates'], () => {
  browserSync({
    server: {
      baseDir: env.output
    }
  });
  
  gulp.watch([
    config.paths.js + '**/*.js', 
    config.paths.img + '**/*', 
    config.paths.fonts + '**/*'
  ], ['assets-watch']);
  gulp.watch(config.paths.styles + '**/*.scss', ['sass']);
  gulp.watch(config.paths.templates + '**/*.jade', ['templates-watch']);
});

gulp.task('build', () => {
  if (!_.has(config.environments, argv.env))
    throw new Error(`Environment '${argv.env}' not found. Please check your config.json`);
  
  let env = _.merge(defaults, config.environments[argv.env]);
  
  copyAssets(env.output);
  buildTemplates(env.locals, env, env.output);
  buildSass(env.output, env.minify, env.reload, env.sourcemaps);
  
  // Copy .htaccess file if necessary 
  if (env.urlRewrite) {
    gulp.src(config.paths.etc + '.htaccess')
      .pipe(gulp.dest(env.output));
  }
});
