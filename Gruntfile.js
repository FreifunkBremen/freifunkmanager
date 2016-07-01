'use strict';
module.exports = function (grunt) {
	// Load grunt tasks automatically, when needed
	require('jit-grunt')(grunt, {
			useminPrepare: 'grunt-usemin',
		});
	require('time-grunt')(grunt);

	grunt.initConfig({
		open: {
			public: {
				url: 'http://localhost:8080'
			}
		},
		connect:{
			public:{
				options:{
					port:8080,
					hostname:'*',
					base:['.']
				}
			}
		},
		jshint: {
			files: ['Gruntfile.js', 'js/**/*.js'],
			options: {
				reporter: require('jshint-stylish')
			}
		},
		watch: {
			livereload: {
				files: [
					'js/**/*.js',
					'css/**/*.css',
				],
				options: {
					livereload: true
				}
			}
		}
	});

	grunt.registerTask('default', ['connect:public','open:public','watch']);

};
