(function () {
    
    var gulp = require('gulp'), args = require('yargs').argv;
    var $ = require('gulp-load-plugins')({lazy: true});
    var config = require('./gulp.config')();
    var del = require('del');

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
    
    
    gulp.task('styles', ['clean-styles'], function(){
        log('compiling Less --> CSS');
        
        return gulp.src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browser:['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
    });
    
    gulp.task('clean-styles', function(done){
        var files = config.temp + '**/*.css';
        clean(files, done);
    });
    
    gulp.task('less-watcher', function(){
        gulp.watch([config.less], ['styles']);
    });
    
    ///////////////////
    function clean(path, done)
    {
        log('Cleaning: ' + $.util.colors.blue(path));
        del(path, done);
    }
    
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
    
}());
