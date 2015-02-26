(function () {
    
    var gulp = require('gulp'), args = require('yargs').argv;
    var $ = require('gulp-load-plugins')({lazy: true});
    var config = require('./gulp.config')();


    function log(msg) {
        var item;
        if (typeof (msg) === 'object') {
            for (item in msg)
                {
                    if (msg.hasOwnProperty(item)) {
                        $.util.log($.util.colors.blue(msg[item]));
                    }
                }
        } else {
            $.util.log($.util.colors.blue(msg));
        }
    }

    gulp.task('vet', function () {

        log('Analizing source with JSHint and JSCS');

        return gulp
            .src(config.alljs)
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jscs())
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
            .pipe($.jshint.reporter('fail'));
    });
}());
