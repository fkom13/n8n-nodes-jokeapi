const gulp = require('gulp');

function copyNodeAssets() {
  // Assurez-vous que les icônes PNG (et SVG si applicable) sont copiées
  return gulp.src('nodes/**/*.{png,svg}') // Updated to copy both png and svg
  .pipe(gulp.dest('dist/nodes'));
}

function copyCredentialAssets() {
  return gulp.src('credentials/**/*.js')
  .pipe(gulp.dest('dist/credentials'));
}

exports.build = gulp.parallel(copyNodeAssets, copyCredentialAssets);
exports.default = exports.build;
