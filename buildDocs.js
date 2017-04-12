/* eslint-env node, mocha */
/*globals Promise:true*/

var fs = require('fs-extra');
var path = require('path');
var marked = require('marked');
var slugcase = require('to-case').slug;
var nunjucks = require('nunjucks');
var jsdom = require('jsdom');
var minify = require('html-minifier').minify;

function buildFileData(file) {

    return new Promise(function(resolve, reject) {

        jsdom.env(marked(fs.readFileSync(file.path, 'utf8')), [], function(err, window) {

            var $ = require('jquery')(window);

            buildPageBlocks(file, $);

            var pageData = {
                title: $('h1').first().text(),
                slug: slugcase(path.basename(file.path, '.md')),
                sections: $('h2').map(function(i, el) {
                    return $(el).text();
                }).get(),
                bodyHtml: $('body').html()
            };

            window.close();

            resolve(pageData);

        });

    });

}

function buildPageBlocks(fileOptions, $) {

    var $pageBlocks = $('<div />');
    var $currentPageBlock;
    var blockCounter = 0;
    var $body = $('body');

    $body.children().each(function(i, el) {

        var $el = $(el);

        if ($el.is('h1') || $el.is('h2')) {
            blockCounter++;
            $currentPageBlock = $(
                '<section id="section-' + slugcase($el.text()) + '" class="attireBlock"><div class="inner"></div></section>'
            ).appendTo($pageBlocks);
        }

        $el.is('h1') && $el.addClass('attireTitleType1');
        $el.is('h2') && $el.addClass('attireTitleType2');
        $el.is('h3') && $el.addClass('attireTitleType3');
        $el.is('ul') && $el.addClass('attireListType1');
        $el.is('ol') && $el.addClass('attireListType1');
        $el.is('hr') && $el.addClass('attireSeparator mod1');
        $el.is('pre') && $el.addClass('attireCodeHighlight');

        if ($el.is('p')) {
            if (fileOptions.emphasizeLead && blockCounter === 1 && $currentPageBlock.find('.attireTextType1').length === 0) {
                $el.addClass('attireTextType1');
            } else {
                $el.addClass('attireTextType2');
            }
        }

        $el.appendTo($currentPageBlock.find('.inner'));

    });

    $body.html($pageBlocks.html());

    if (fileOptions.author) {
        $(
            nunjucks.render(path.resolve(__dirname, 'src/templates/author.html'), {author: fileOptions.author})
        ).insertAfter($('p').first());
    }

}

module.exports = function(userOptions) {

    var options = Object.assign({
        files: [],
        projectTitle: 'My docs',
        searchPlaceholderCaption: 'Search documentation',
        dest: './docs/',
        jsFiles: [],
        cssFiles: [],
        minifyHtml: true,
        inlineCss: false,
        baseUrl: '',
        assetDistPath: 'https://cdn.rawgit.com/dbrekalo/attire/master/dist/',
        // assetDistPath: '../dist/',
        githubUrl: undefined,
        userRepositories: undefined
    }, userOptions);

    options.cssFiles = [
        options.inlineCss ? path.resolve(__dirname, 'dist/css/docsBuild.css') : options.assetDistPath + 'css/docsBuild.min.css'
    ].concat(options.cssFiles);

    options.jsFiles = [
        options.assetDistPath + 'js/docsBuild.min.js'
    ].concat(options.jsFiles);

    if (options.inlineCss) {
        options.cssFiles = options.cssFiles.map(function(cssFile) {
            return fs.readFileSync(cssFile, 'utf8');
        });
    }

    return Promise.all(options.files.map(function(file) {

        return buildFileData(typeof file === 'string' ? {path: file} : file);

    })).then(function(pagesData) {

        var navigation = pagesData.map(function(pageData) {

            return {
                caption: pageData.title,
                url: options.baseUrl + pageData.slug + '#' + slugcase(pageData.title),
                pointer: pageData.slug + '#' + slugcase(pageData.title),
                sections: pageData.sections.map(function(sectionTitle) {
                    return {
                        caption: sectionTitle,
                        url: options.baseUrl + pageData.slug + '#' + slugcase(sectionTitle),
                        pointer: pageData.slug + '#' + slugcase(sectionTitle)
                    };
                })
            };

        });

        pagesData.forEach(function(pageData) {

            pageData.pageTitle = pageData.title + ' - ' + options.projectTitle;
            pageData.projectTitle = options.projectTitle;
            pageData.searchPlaceholderCaption = options.searchPlaceholderCaption;
            pageData.userRepositories = options.userRepositories,
            pageData.navigation = navigation;
            pageData.inlineCss = options.inlineCss;
            pageData.cssFiles = options.cssFiles;
            pageData.jsFiles = options.jsFiles;
            pageData.githubUrl = options.githubUrl;
            pageData.assetDistPath = options.assetDistPath;

            var html = nunjucks.render(path.resolve(__dirname, 'src/templates/docs.html'), pageData);

            if (options.minifyHtml) {
                html = minify(html, {collapseWhitespace: true});
            }

            fs.writeFileSync(options.dest + pageData.slug + '.html', html);

        });

    });

};
