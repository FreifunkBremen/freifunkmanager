import browserSync from 'browser-sync';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import watchify from 'watchify';

const gulpPlugins = gulpLoadPlugins();

function bundle (watching = false) {
	const browserifyConf = {
		'debug': true,
		'entries': ['js/index.js'],
		'transform': ['babelify']};

	if (watching) {
		browserifyConf.plugin = [watchify];
	}

	const browser = browserify(browserifyConf);

	function bundler () {
		return browser.bundle().
			on('error', (err) => {
				console.log(err.message);
			}).
			pipe(source('app.js')).
			pipe(buffer()).
			pipe(sourcemaps.init({'loadMaps': true})).
			pipe(gulpPlugins.uglify({
				'mangle': {'reserved': ['moment']}
			})).
			pipe(sourcemaps.write('./')).
			pipe(gulp.dest('./'));
	}

	browser.on('update', () => {
		bundler();
		console.log('scripts rebuild');
	});

	return bundler();
}

gulp.task('scripts', () => {
	bundle();
});

gulp.task('styles', () => {
	gulp.src('css/styles.less').
		pipe(gulpPlugins.plumber()).
		pipe(sourcemaps.init()).
		pipe(gulpPlugins.less({
			'includePaths': ['.']
		})).
		pipe(gulpPlugins.autoprefixer()).
		pipe(sourcemaps.write('./')).
		pipe(gulp.dest('./'));
});

gulp.task('build', [
	'scripts',
	'styles'
]);

gulp.task('watch', () => {
	bundle(true);
	gulp.watch('css/**/*.less', ['styles']);
});

gulp.task('serve', ['watch'], () => {
	browserSync({
		'notify': false,
		'port': 9000,
		// Proxy: 'example.com',
		'server': {
			'baseDir': '.'
		}
	});

	gulp.watch([
		'**/*.html',
		'**/*.php',
		'styles.css',
		'app.js'
	]).on('change', browserSync.reload);
});

gulp.task('default', [
	'build',
	'serve'
]);
