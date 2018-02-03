var attire = require('./index.js');

module.exports = function(grunt) {

    var environment = grunt.option('env') || 'development';
    var isDevEnvironment = environment === 'development';

    grunt.initConfig({

        sass: {
            app: {
                files: isDevEnvironment ? {
                    'dist/css/build.css': 'src/scss/demoApp.scss',
                    'dist/css/demoBuild.css': 'src/scss/demoApp.scss',
                    'dist/css/docsBuild.css': 'src/scss/docsApp.scss'
                } : {
                    'dist/css/build.min.css': 'src/scss/demoApp.scss',
                    'dist/css/demoBuild.min.css': 'src/scss/demoApp.scss',
                    'dist/css/docsBuild.min.css': 'src/scss/docsApp.scss'
                },
                options: {
                    outputStyle: isDevEnvironment ? 'expanded' : 'compressed',
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
            target: [
                'src/js/**/*.js',
                'index.js',
                'buildDocs.js',
                'buildDemo.js',
                'Gruntfile.js'
            ]
        },

        sync: {
            fonts: {
                files: [{
                    cwd: 'src/fonts/icons/fonts',
                    src: ['**/*'],
                    dest: 'dist/fonts'
                }, {
                    cwd: 'src/fonts/webFont',
                    src: ['**/*'],
                    dest: 'dist/fonts'
                }],
                updateAndDelete: true
            },
            images: {
                files: [{
                    cwd: 'src/images',
                    src: ['**/*'],
                    dest: 'dist/images'
                }],
                updateAndDelete: true
            }
        },

        googlefonts: {
            build: {
                options: {
                    fontPath: 'src/fonts/webFont',
                    cssFile: 'src/scss/partials/_webFonts.scss',
                    httpPath: 'https://gitcdn.xyz/repo/dbrekalo/attire/master/dist/fonts/',
                    formats: {eot: true, ttf: true, woff: true, woff2: true, svg: true},
                    fonts: [{
                        family: 'Lato',
                        styles: [300, 400, 700, 900]
                    }]
                }
            }
        },

        bump: {
            options: {
                files: ['package.json', 'package-lock.json', 'bower.json'],
                commitFiles: ['package.json', 'package-lock.json', 'bower.json'],
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

    grunt.registerTask('buildDocs', function() {

        var done = this.async();

        attire.buildDocs({
            files: [
                {
                    path: './test-docs-md/Section1.md',
                    emphasizeLead: true,
                    author: {
                        caption: 'Damir Brekalo',
                        url: 'https://github.com/dbrekalo',
                        image: 'https://s.gravatar.com/avatar/32754a476fb3db1c5a1f9ad80c65d89d?s=80',
                        email: 'dbrekalo@gmail.com',
                        github: 'https://github.com/dbrekalo',
                        twitter: 'https://twitter.com/dbrekalo'
                    }
                },
                './test-docs-md/Section2.md',
                './test-docs-md/Section3.md'
            ],
            dest: './docs/',
            projectTitle: 'attire docs',
            githubUrl: 'https://github.com/dbrekalo/attire',
            inlineCss: false,
            userRepositories: {
                user: 'dbrekalo',
                onlyWithPages: true
            }
        }).then(function() {
            done();
            grunt.log.ok(['Docs builded']);
        });

    });

    grunt.registerTask('buildDemo', function() {

        var done = this.async();

        attire.buildDemo({
            file: 'README.md',
            dest: 'index.html',
            title: 'Attire - build demo and documentation pages',
            description: 'Frontend setup and styling for simple and responsive demo pages',
            canonicalUrl: 'https://github.com/dbrekalo/attire/',
            githubUrl: 'https://github.com/dbrekalo/attire',
            userRepositories: {
                user: 'dbrekalo',
                onlyWithPages: true
            },
            author: {
                caption: 'Damir Brekalo',
                url: 'https://github.com/dbrekalo',
                image: 'https://s.gravatar.com/avatar/32754a476fb3db1c5a1f9ad80c65d89d?s=80',
                email: 'dbrekalo@gmail.com',
                github: 'https://github.com/dbrekalo',
                twitter: 'https://twitter.com/dbrekalo'
            },
            afterParse: function($) {
                $('a').first().parent().remove();
            },
            inlineCss: true,
        }).then(function() {
            done();
            grunt.log.ok(['Demo builded']);
        });

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['eslint', 'googlefonts', 'sass', 'sync', 'buildDemo', 'buildDocs']);

};
