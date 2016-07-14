'use strict';

module.exports = function (grunt) {

	// Load grunt tasks automatically, when needed
	require('jit-grunt')(grunt, {
		useminPrepare: 'grunt-usemin',
		ngtemplates: 'grunt-angular-templates',
		injector: 'grunt-asset-injector',
		cdnify: 'grunt-google-cdn',
		replace: 'grunt-text-replace'
	});

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Define the configuration for all the tasks
	grunt.initConfig({
		open: {
			public: {
				url: 'http://localhost:8080'
			}
		},
		watch: {
			injectJS: {
				files: [
					'public/{app,components}/**/*.js',
					'!public/app/app.js'],
				tasks: ['injector:scripts']
			},
			injectCss: {
				files: [
					'public/{app,components}/**/*.css'
				],
				tasks: ['injector:css']
			},
			injectStylus: {
				files: [
					'public/{app,components}/**/*.styl'],
				tasks: ['injector:stylus']
			},
			stylus: {
				files: [
					'public/{app,components}/**/*.styl'],
				tasks: ['stylus', 'autoprefixer']
			},
			jade: {
				files: [
					'public/{app,components}/*',
					'public/{app,components}/**/*.jade'],
				tasks: ['jade']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				files: [
					'{.tmp,public}/{app,components}/**/*.css',
					'{.tmp,public}/{app,components}/**/*.html',
					'{.tmp,public}/{app,components}/**/*.js',
					'public/img/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
				],
				options: {
					livereload: true
				}
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: 'public/.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'public/{app,components}/**/*.js',
			]
		},

		// Empties folders to start fresh
		clean: {
			build: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'tmp',
						'build/*',
						'!build/.git*',
						'!build/.openshift',
						'!build/Procfile'
					]
				}]
			}
		},
		// Add vendor prefixed styles
		autoprefixer: {
			options: {
				browsers: ['last 1 version']
			},
			build: {
				files: [{
					expand: true,
					cwd: '.tmp/',
					src: '{,*/}*.css',
					dest: '.tmp/'
				}]
			}
		},
		// Automatically inject Bower components into the app
		wiredep: {
			target: {
				src: 'public/index.html',
				ignorePath: 'public/',
				exclude: ['/json3/', '/es5-shim/' ]
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			html: ['public/index.html'],
			options: {
				dest: 'build'
			}
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			html: ['build/{,*/}*.html'],
			css: ['build/{,*/}*.css'],
			js: ['build/{,*/}*.js'],
			options: {
				assetsDirs: [
					'build',
					'build/img'
				],
				// This is so we update image references in our ng-templates
				patterns: {
					js: [
						[/(img\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
					]
				}
			}
		},

		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			build: {
				files: [{
					expand: true,
					cwd: 'public/img',
					src: '{,*/}*.{png,jpg,jpeg,gif}',
					dest: 'build/img'
				}]
			}
		},

		svgmin: {
			build: {
				files: [{
					expand: true,
					cwd: 'public/img',
					src: '{,*/}*.svg',
					dest: 'build/img'
				}]
			}
		},

		// Allow the use of non-minsafe AngularJS files. Automatically makes it
		// minsafe compatible so Uglify does not destroy the ng references
		ngAnnotate: {
			build: {
				files: [{
					expand: true,
					cwd: '.tmp/concat',
					src: '*/**.js',
					dest: '.tmp/concat'
				}]
			}
		},

		// Package all the html partials into a single javascript payload
		ngtemplates: {
			options: {
				// This should be the name of your apps angular module
				module: 'ffhb',
				htmlmin: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true,
					removeEmptyAttributes: true,
					removeRedundantAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true
				},
				usemin: 'app/app.js'
			},
			main: {
				cwd: 'public',
				src: ['{app,components}/**/*.html'],
				dest: '.tmp/templates.js'
			},
			tmp: {
				cwd: '.tmp',
				src: ['{app,components}/**/*.html'],
				dest: '.tmp/tmp-templates.js'
			}
		},

		// Replace Google CDN references
		cdnify: {
			build: {
				html: ['build/*.html']
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			build: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'public',
					dest: 'build',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						//'bower_components/**/*',
						'img/{,*/}*.{webp}',
						'fonts/**/*',
						'img/*.png',
						'index.html'
					]
				},
				{
					expand: true,
					cwd: 'public/bower_components/leaflet/dist/images',
					dest: 'build/app/images',
					src: [
						'*.*'
					]
				},
				{
					expand: true,
					cwd: 'public/bower_components/bootstrap/fonts',
					dest: 'build/fonts',
					src: [
						'*.*'
					]
				},
				{
					expand: true,
					cwd: '.tmp/img',
					dest: 'build/img',
					src: ['generated/*']
				}]
			},
			styles: {
				expand: true,
				cwd: 'public',
				dest: '.tmp/',
				src: ['{app,components}/**/*.css']
			}
		},

		// Run some tasks in parallel to speed up the build process
		concurrent: {
			all: [
				'jade',
				'stylus',
				'imagemin',
				'svgmin'
			]
		},
		connect:{
			public:{
				options:{
					port:8080,
					hostname:'*',
					base:['.tmp','public']
				}
			},
		},

		// Compiles Jade to html
		jade: {
			compile: {
				options: {
					data: {
						debug: false
					}
				},
				files: [{
					expand: true,
					cwd: 'public',
					src: [
						'{app,components}/**/*.jade'
					],
					dest: '.tmp',
					ext: '.html'
				}]
			}
		},
		// Compiles Stylus to CSS
		stylus: {
			build: {
				options: {
					paths: [
						'public/bower_components',
						'public/app',
						'public/components'
					],
					"include css": true
				},
				files: {
					'.tmp/app/app.css' : 'public/app/app.styl'
				}
			}
		},

		injector: {
			options: {

			},
			// Inject application script files into index.html (doesn't include bower)
			scripts: {
				options: {
					transform: function(filePath) {
						filePath = filePath.replace('/public/', '');
						filePath = filePath.replace('/.tmp/', '');
						return '<script src="' + filePath + '"></script>';
					},
					starttag: '<!-- injector:js -->',
					endtag: '<!-- endinjector -->'
				},
				files: {
					'public/index.html': [
							['{.tmp,public}/{app,components}/**/*.js',
							 '!{.tmp,public}/app/app.js']
						]
				}
			},

			// Inject component styl into app.styl
			stylus: {
				options: {
					transform: function(filePath) {
						filePath = filePath.replace('/public/app/', '');
						filePath = filePath.replace('/public/components/', '');
						return '@import \'' + filePath + '\';';
					},
					starttag: '// injector',
					endtag: '// endinjector'
				},
				files: {
					'public/app/app.styl': [
						'public/{app,components}/**/*.styl',
						'!public/app/app.styl'
					]
				}
			},

			// Inject component css into index.html
			css: {
				options: {
					transform: function(filePath) {
						filePath = filePath.replace('/public/', '');
						filePath = filePath.replace('/.tmp/', '');
						return '<link rel="stylesheet" href="' + filePath + '">';
					},
					starttag: '<!-- injector:css -->',
					endtag: '<!-- endinjector -->'
				},
				files: {
					'public/index.html': [
						'public/{app,components}/**/*.css'
					]
				}
			}
		},
		replace: {
			url: {
				src: ['build/app/app.js'],
				overwrite:true,
				replacements: [{
					from: 'http://localhost:8080/',
					to: 'https://mgmt.ffhb.de/'
				}]
			}
		}
	});

	grunt.registerTask('serve', [
		'clean:build',
		'injector:stylus',
		'concurrent:all',
		'injector',
		'wiredep',
		'autoprefixer',
		'connect:public',
		'open:public',
		'watch'
	]);

	grunt.registerTask('serve-build', [
		'open:public',
		'connect:build'
	]);

	grunt.registerTask('build', [
		'newer:jshint',
		'clean:build',
		'injector:stylus',
		'concurrent:all',
		'injector',
		'wiredep',
		'useminPrepare',
		'autoprefixer',
		'ngtemplates',
		'concat',
		'ngAnnotate',
		'copy:build',
		'cssmin',
		'uglify',
		'usemin'
	]);
	grunt.registerTask('release', [
		'build',
		'replace:url',
	]);

	grunt.registerTask('default', [
		'serve'
	]);
};
