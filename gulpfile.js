var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('default', ['browser-sync']);

gulp.task('browser-sync', function() {
  browserSync.init({
      server: {
          baseDir: "./"
      },
      serveStatic: ['./'],
      open: false
  });
  gulp.watch("./js").on('change', browserSync.reload);
  gulp.watch("index.html").on('change', browserSync.reload)
});
