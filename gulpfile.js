"use strict";

let path = require('path');

let gulp = require('gulp');
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

let env = _.defaults(config.environments[config.env], defaults);


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

function staticPaths() {
  return config.static.map((dir) => config.paths.static + dir + '/**');
}

function copyAssets(dest) {
  gulp.src(config.paths.etc + 'favicon.ico')
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
  
  return gulp.src(staticPaths(), { base: config.paths.static })
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
}

function buildSass(out, minify, reloadBS, useSourcemap) {
  let outputStyle = minify ? 'compressed' : 'nested';
  
  return gulp.src(config.paths.styles + 'app.scss')
    .pipe(gulpif(useSourcemap, sourcemaps.init()))
    .pipe(sass({ outputStyle }).on('error', sass.logError))
    .pipe(gulpif(useSourcemap, sourcemaps.write('.')))
    .pipe(gulp.dest(out + 'css'))
    .pipe(gulpif(reloadBS, reload({ stream: true, match: '**/*.css' })));
}

function buildTemplates(locals, path) {
  return gulp.src(config.paths.templates + 'pages/*.jade')
    .pipe(jade({
      locals: _.merge({}, locals, jadeUtils),
      pretty: '\t',
    }).on('error', (err) => console.log(err)))
    .pipe(gulp.dest(path));
}

gulp.task('templates', () => buildTemplates(env.locals, env.output));
gulp.task('sass', () => buildSass(env.output, env.minify, env.reload, env.sourcemaps));
gulp.task('assets', () => copyAssets(env.output));

gulp.task('templates-watch', ['templates'], reload);
gulp.task('assets-watch', ['assets'], reload);

gulp.task('serve', ['sass', 'templates'], () => {
  browserSync({
    server: {
      baseDir: env.output
    }
  });
  
  gulp.watch(staticPaths(), ['assets-watch']);
  
  gulp.watch(config.paths.styles + '**/*.scss', ['sass']);
  gulp.watch(config.paths.templates + '**/*.jade', ['templates-watch']);
});

gulp.task('build', () => {
  if (!_.has(config.environments, argv.env))
    throw new Error(`Environment '${argv.env}' not found. Please check your config.json`);
  
  env = _.defaults(config.environments[argv.env], defaults);

  copyAssets(env.output);
  buildTemplates(env.locals, env.output);
  buildSass(env.output, env.minify, env.reload, env.sourcemaps);
  
  // Copy .htaccess file if necessary 
  if (env.urlRewrite) {
    gulp.src(config.paths.etc + '.htaccess')
      .pipe(newer(env.output))
      .pipe(gulp.dest(env.output));
  }
});
