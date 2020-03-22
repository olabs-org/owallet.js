const browserify = require('browserify');
const gulp = require('gulp');
const uglify = require('gulp-uglify-es').default;
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

gulp.task('all', function () {
  return browserify('./index.js')
  .exclude('react-native')
  .exclude('./wordlists/japanese.json')
  .exclude('./wordlists/spanish.json')
  .exclude('./wordlists/italian.json')
  .exclude('./wordlists/french.json')
  .exclude('./wordlists/korean.json')
  .exclude('./wordlists/chinese_traditional.json')
  .exclude('./wordlists/chinese_simplified.json')
  .bundle()
  .pipe(source('owallet.all.min.js'))
  .pipe(buffer())
  .pipe(uglify({ toplevel: true }))
  .pipe(gulp.dest('./dist'));
});

gulp.task('lib', function () {
  return browserify('./index.js')
  .exclude('react-native')
  .exclude('./src/generator.js')
  .bundle()
  .pipe(source('owallet.lib.min.js'))
  .pipe(buffer())
  .pipe(uglify({toplevel: true}))
  .pipe(gulp.dest('./dist'));
});

gulp.task('generator', function () {
  return browserify('./src/generator.js')
  .exclude('./wordlists/japanese.json')
  .exclude('./wordlists/spanish.json')
  .exclude('./wordlists/italian.json')
  .exclude('./wordlists/french.json')
  .exclude('./wordlists/korean.json')
  .exclude('./wordlists/chinese_traditional.json')
  .exclude('./wordlists/chinese_simplified.json')
  .bundle()
  .pipe(source('owallet.generator.min.js'))
  .pipe(buffer())
  .pipe(uglify({ toplevel: true }))
  .pipe(gulp.dest('./dist'));
});