var gulp   = require('gulp')
var babel  = require('gulp-babel')
var rjs    = require('requirejs')
var fs     = require('fs')

gulp.task('babel', function () {
  return gulp.src('src/**/*')
    .pipe(babel({ modules: 'ignore' }))
    .pipe(gulp.dest('lib/'))
})

gulp.task('rjs', [ 'babel' ], function (done) {
  rjs.optimize({
    baseUrl: './',
    name: 'extplug/custom-emoji/main',
    paths: {
      // plug-modules defines, these are defined at runtime
      // so the r.js optimizer can't find them
      plug: 'empty:',
      'extplug/custom-emoji': 'lib/',
      extplug: 'empty:',
      lang: 'empty:',
      backbone: 'empty:',
      jquery: 'empty:',
      underscore: 'empty:',
      meld: 'empty:',
      'plug-modules': 'empty:'
    },
    optimize: 'none',
    out: function (text) {
      fs.writeFile('build/custom-emoji.js', text, done)
    }
  })
})

gulp.task('build', [ 'rjs' ])
