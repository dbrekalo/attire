/* eslint-env node, mocha */
/*globals Promise:true*/

var fs = require('fs-extra');
var path = require('path');
var marked = require('marked');
var slugcase = require('to-case').slug;
var nunjucks = require('nunjucks');
var jsdom = require('jsdom');
var minify = require('html-minifier').minify;

function buildPageData(options) {

    return new Promise(function(resolve, reject) {

        jsdom.env(marked(fs.readFileSync(options.file, 'utf8')), [], function(err, window) {

            var $ = require('jquery')(window);

            options.afterParse && options.afterParse($);

            if (options.includeSection) {
                var title = '<h2>' + options.includeSection.title + '</h2>';
                var contents = marked(options.includeSection.contents);
                $(title + contents).insertBefore($('h1, h2').eq(options.includeSection.atPosition));
            }

            buildPageBlocks(options, $);

            options.bodyHtml = $('body').html();

            window.close();

            resolve(options);

        });

    });

}

function buildPageBlocks(fileOptions, $) {

    var $pageBlocks = $('<div />');
    var $currentPageBlock;
    var blockCounter = 0;
    var $body = $('body');
    var navItems = [];

    $body.children().each(function(i, el) {

        var $el = $(el);

        if ($el.is('h1') || $el.is('h2')) {

            blockCounter++;

            $currentPageBlock = $(
                '<section id="section-' + slugcase($el.text()) + '" class="attireBlock"><div class="inner"></div></section>'
            ).appendTo($pageBlocks);

            navItems.push({
                url: '#section-' + slugcase($el.text()),
                caption: blockCounter === 1 ? 'About' : $el.text()
            });
        }

        $el.is('h1') && $el.addClass('attireTitleType1');
        $el.is('h2') && $el.addClass('attireTitleType2');
        $el.is('h3') && $el.addClass('attireTitleType3');
        $el.is('ul') && $el.addClass('attireListType1');
        $el.is('ol') && $el.addClass('attireListType1');
        $el.is('hr') && $el.addClass('attireSeparator mod1');
        $el.is('pre') && $el.addClass('attireCodeHighlight');

        if ($el.is('p')) {
            if (blockCounter === 1 && $currentPageBlock.find('.attireTextType1').length === 0) {
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

    fileOptions.navItems = navItems;

}

module.exports = function(userOptions) {

    var options = Object.assign({
        file: 'README.md',
        dest: 'index.html',
        title: 'Page title',
        description: undefined,
        canonicalUrl: undefined,
        githubUrl: undefined,
        userRepositories: undefined,
        author: undefined,
        afterParse: undefined,
        jsFiles: [],
        cssFiles: [],
        minifyHtml: true,
        inlineCss: false,
        assetDistPath: 'https://gitcdn.xyz/repo/dbrekalo/attire/master/dist/'
    }, userOptions);

    options.cssFiles = [options.inlineCss ? path.resolve(__dirname, 'dist/css/demoBuild.min.css') : options.assetDistPath + 'css/demoBuild.min.css'].concat(options.cssFiles);
    options.jsFiles = [options.assetDistPath + 'js/demoBuild.min.js'].concat(options.jsFiles);

    if (options.inlineCss) {
        options.cssFiles = options.cssFiles.map(function(cssFile) {
            return fs.readFileSync(cssFile, 'utf8');
        });
    }

    return buildPageData(options).then(function(pageData) {

        var html = nunjucks.render(path.resolve(__dirname, 'src/templates/demo.html'), pageData);

        if (options.minifyHtml) {
            html = minify(html, {collapseWhitespace: true});
        }

        fs.writeFileSync(options.dest, html);

    });

};
