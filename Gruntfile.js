/* jshint node: true */
module.exports = function(grunt) {

    grunt.initConfig({

        uglify: {
            min: {
                files: {
                    'dist/js/build.min.js': ['dist/js/build.js']
                }
            }
        },

        concat: {
            standalone: {
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/preCode/preCode.js',
                    'bower_components/prism/prism.js',
                    'bower_components/slug/slug.js',

                    'src/js/main.js'
                ],
                dest: 'dist/js/build.js'
            }
        },

        jshint: {
            options: {
                'jshintrc': '.jshintrc'
            },
            all: ['src','Gruntfile.js']
        },

        jscs: {
            options: {
                config: '.jscsrc'
            },
            scripts: {
                files: {
                    src: [
                        'src/**/*.js'
                    ]
                }
            }
        },

        sass: {
            expanded: {
                files: {
                    'dist/css/build.css': 'src/scss/main.scss'
                },
                options: {
                    outputStyle: 'expanded',
                    sourceMap: false,
                    precision: 5
                }
            },
            minified: {
                files: {
                    'dist/css/build.min.css': 'src/scss/main.scss'
                },
                options: {
                    outputStyle: 'compressed',
                    sourceMap: false,
                    precision: 5
                }
            }
        },

        watch: {
            jsFiles: {
                expand: true,
                files: ['src/js/**/*.js', 'Gruntfile.js'],
                tasks: ['jshint', 'jscs', 'uglify', 'concat'],
                options: {
                    spawn: false
                }
            },
            cssFiles: {
                expand: true,
                files: ['src/scss/**/*.scss'],
                tasks: ['sass'],
                options: {
                    spawn: false
                }
            }
        }

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['jshint',  'jscs', 'uglify', 'concat', 'sass']);

};
