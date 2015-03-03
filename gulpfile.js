(function() {

    var gulp = require('gulp'),
        args = require('yargs').argv;
    var browserSync = require('browser-sync');
    var $ = require('gulp-load-plugins')({
        lazy: true
    });
    var config = require('./gulp.config')();
    var del = require('del');
    var port = process.env.PORT || config.defaultPort;

    gulp.task('vet', function() {

        log('Analizing source with JSHint and JSCS');

        return gulp
            .src(config.alljs)
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jscs())
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {
                verbose: true
            }))
            .pipe($.jshint.reporter('fail'));
    });


    gulp.task('styles', ['clean-styles'], function() {
        log('compiling Less --> CSS');

        return gulp.src(config.less)
            .pipe($.plumber())
            .pipe($.less())
            .pipe($.autoprefixer({
                browser: ['last 2 version', '> 5%']
            }))
            .pipe(gulp.dest(config.temp));
    });

    gulp.task('clean-styles', function(done) {
        var files = config.temp + '**/*.css';
        clean(files, done);
    });

    gulp.task('less-watcher', function() {
        gulp.watch([config.less], ['styles']);
    });

    gulp.task('wiredep', function() {
        log('Wire up the bower css and js and our app js into the html');
        var options = config.getWiredepDefaultOptions();
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.index)
            .pipe(wiredep(options))
            .pipe($.inject(gulp.src(config.js)))
            .pipe(gulp.dest(config.client));
    });

    gulp.task('injectAll', ['wiredep', 'styles'], function() {
        log('Wire up the app css into the html, and call wiredep');

        return gulp
            .src(config.index)
            .pipe($.inject(gulp.src(config.css)))
            .pipe(gulp.dest(config.client));
    });


    gulp.task('serve-dev', ['injectAll'], function() {

        var isDev = true;
        var nodeOptions = {
            script: config.nodeServer,
            delayTime: 1,
            env: {
                'PORT': port,
                'NODE_ENV': isDev ? 'dev' : 'build'
            },
            watch: [config.server]
        };

        return $.nodemon(nodeOptions)
            .on('restart', function(ev) {
                log('*** nodemon restarted');
                log('files changed on restart:\n' + ev);
                setTimeout(function() {
                    browserSync.notify('reload now ...');
                    browserSync.reload({
                        stream: false
                    });
                }, config.browserReloadDelay);
            })
            .on('start', function() {
                log('*** nodemon started');
                startBrowserSync();
            })
            .on('crash', function() {
                log('*** nodemon crashed: script crashed for some reason');
            })
            .on('exit', function() {
                log('*** nodemon exited cleanly');
            });
    });

    ///////////////////
    function changeEvent(event) {
        var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
        log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
    }

    function startBrowserSync() {
        if (args.nosync || browserSync.active) {
            return;
        }
        log('Starting browser-sync on port ' + port);

        gulp.watch([config.less], ['styles'])
            .on('change', function(event) {
                changeEvent(event);
            });

        var options = {
            proxy: 'localhost:' + port,
            port: 3000,
            files: [
                config.client + '**/*.*',
                '!' + config.less,
                config.temp + '**/*.css'
            ],
            ghostMode: {
                clicks: true,
                location: false,
                froms: true,
                scroll: true
            },
            injectChanges: true,
            logFileChanges: true,
            logLevel: 'debug',
            logPrefix: 'gulp-patterns',
            notify: true,
            reloadDelay: 0 //1000
        };

        browserSync(options);
    }

    function clean(path, done) {
        log('Cleaning: ' + $.util.colors.blue(path));
        del(path, done);
    }

    function log(msg) {
        var item;
        if (typeof(msg) === 'object') {
            for (item in msg) {
                if (msg.hasOwnProperty(item)) {
                    $.util.log($.util.colors.blue(msg[item]));
                }
            }
        } else {
            $.util.log($.util.colors.blue(msg));
        }
    }

}());
