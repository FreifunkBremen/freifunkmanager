"use strict";

module.exports = function (grunt) {
	// Load grunt tasks automatically, when needed
	require("jit-grunt")(grunt, {
			useminPrepare: "grunt-usemin",
		});
	require("time-grunt")(grunt);

	grunt.initConfig({
		open: {
			public: {
				url: "http://localhost:8080"
			}
		},
		connect:{
			public:{
				options:{
					port:8080,
					hostname:"*",
					base:["."]
				}
			}
		},
		jshint: {
			files: ["js/**/*.js"],
			options: {
				reporter: require("jshint-stylish")
			}
		},
		watch: {
			livereload: {
				files: [
					"js/**/*.js",
					"css/**/*.css",
				],
				options: {
					livereload: true
				}
			}
		},
		clean: {
			build: {
				files: [{
					dot: true,
					src: [
						"build/*",
						"!build/.git*",
					]
				}]
			}
		},
		copy: {
			html: {
				options: {
					process: function (content) {
						return content.replace("#revision#", grunt.option("gitRevision"))
					}
				},
				src: ["*.html"],
				expand: true,
				cwd: "html/",
				dest: "build/"
			},
			font: {
				src: ["fonts/*"],
				dest: "build/"
			},
			favicon: {
				src: ["favicon*"],
				dest: "build/"
			},
			config: {
				src: [ "config*.example" ],
				expand: true,
				dest: "build/"
			}
		},
		cssmin: {
			target: {
				files: {
					"build/css/style.css": [ "bower_components/leaflet/dist/leaflet.css",
																"bower_components/Leaflet.label/dist/leaflet.label.css",
																"css/**/*.css"
															]
				}
			}
		},
		requirejs: {
			compile: {
				options: {
					baseUrl: "js",
					name: "../node_modules/almond/almond",
					mainConfigFile: "js/app.js",
					include: "app",
					wrap: true,
					optimize: "uglify",
					out: "build/app.js"
				}
			}
		}
	});
	grunt.registerTask("build",[
		"jshint",
		"clean",
		"copy",
		"cssmin",
		"requirejs:compile"
	]);
	grunt.registerTask("default", ["connect:public","open:public","watch"]);

};
