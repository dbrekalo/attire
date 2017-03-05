/* eslint-env node, mocha */
/*globals Promise:true*/

var fs = require('fs-extra');
var path = require('path');
var marked = require('marked');
var slugcase = require('to-case').slug;
var nunjucks = require('nunjucks');
var jsdom = require('jsdom');

function buildFileData(file) {

    return new Promise(function(resolve, reject) {

        jsdom.env(marked(fs.readFileSync(file.path, 'utf8')), [], function(err, window) {

            var $ = require('jquery')(window);

            buildPageBlocks(file, $);

            var pageData = {
                title: $('h1').first().text(),
                slug: slugcase(path.basename(file.path, '.md')),
                sections: $('h2, h3').map(function(i, el) {
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
        dest: './docs/'
    }, userOptions);

    return Promise.all(options.files.map(function(file) {

        return buildFileData(typeof file === 'string' ? {path: file} : file);

    })).then(function(pagesData) {

        var navigation = pagesData.map(function(pageData) {

            return {
                caption: pageData.title,
                url: pageData.slug,
                sections: pageData.sections.map(function(sectionTitle) {
                    return {
                        caption: sectionTitle,
                        url: pageData.slug + '#' + slugcase(sectionTitle)
                    };
                })
            };

        });

        pagesData.forEach(function(pageData) {

            pageData.pageTitle = pageData.title + ' - ' + options.projectTitle;
            pageData.projectTitle = options.projectTitle;
            pageData.navigation = navigation;

            var html = nunjucks.render(path.resolve(__dirname, 'src/templates/docs.html'), pageData);
            fs.writeFileSync(options.dest + pageData.slug + '.html', html);

        });

    });

};
