/* jshint node: true */
module.exports = function(grunt) {

    grunt.initConfig({

        sass: {
            expanded: {
                files: {
                    'dist/css/build.css': 'src/scss/main.scss'
                },
                options: {
                    outputStyle: 'expanded',
                    sourceMap: false,
                    precision: 5,
                    includePaths: ['node_modules']
                }
            },
            minified: {
                files: {
                    'dist/css/build.min.css': 'src/scss/main.scss'
                },
                options: {
                    outputStyle: 'compressed',
                    sourceMap: false,
                    precision: 5,
                    includePaths: ['node_modules']
                }
            }
        },

        eslint: {
            options: {
                configFile: '.eslintrc.js'
            },
            target: ['src/js/**/*.js', 'Gruntfile.js']
        },

        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commitFiles: ['package.json', 'bower.json'],
                tagName: '%VERSION%',
                push: false
            }
        },

        watch: {
            jsFiles: {
                expand: true,
                files: ['src/js/**/*.js', 'Gruntfile.js'],
                tasks: ['eslint'],
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
    grunt.registerTask('build', ['eslint', 'sass']);

};
