var $ = window.$ = require('jquery');
var View = require('jquery-simple-view');
var slug = require('slug');
var shuffleArray = require('shuffle-array');

require('when-in-viewport');

var AttireController;
var AttireNavigation;
var AttireUserRepositories;

AttireController = View.extend({

    initialize: function() {

        this.addView(new AttireNavigation());
        this.setupCodeHighlight();
        this.setupAttireQueue();
        this.mapView('.attireUserRepositories', AttireUserRepositories);

    },

    setupCodeHighlight: function() {

        var Prism = require('prismjs');

        require('prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.js');

        Prism.plugins.NormalizeWhitespace.setDefaults({
            'remove-trailing': true,
            'remove-indent': true,
            'left-trim': true,
            'right-trim': true
        });

        Prism.highlightAll();

        $('.attireCodeToggleBlock').on('click', '.attireCodeToggleBtn', function(e) {

            $(e.delegateTarget).toggleClass('isActive');

        });

    },

    setupAttireQueue: function() {

        if (window.attireQueue && window.attireQueue.length) {
            $.each(window.attireQueue, function(i, callback) {
                callback($);
            });
        }

        window.attireQueue = {
            push: function(callback) {
                callback($);
            }
        };

    }

});

AttireNavigation = View.extend({

    initialize: function() {

        this.$el = this.setupElement();

    },

    events: {
        'click > .toggleBtn': function(e) {
            $(e.currentTarget).toggleClass('isActive');
        }
    },

    setupElement: function() {

        var $prerenderedEl = $('.attireMainNav');

        if ($prerenderedEl.length) {
            return $prerenderedEl;
        }

        var $navElement = $(
            '<nav class="attireMainNav">' +
                '<button class="toggleBtn iconMenu" type="button">Toggle navigation</button>' +
            '</nav>'
        );
        var $navList = $('<ul>').appendTo($navElement);

        $('.attireBlock').each(function(i, attireBlock) {

            var $attireBlock = $(attireBlock);
            var $title = $attireBlock.find('h1, h2, h3, h4, h5').first();

            if ($title.length) {

                var title = $title.data('nav-title') || $title.text();
                var titleSlug = slug(title, {lower: true});

                $('<li><a href="#section-' + titleSlug + '">' + title + '</a></li>').appendTo($navList);
                $attireBlock.attr('id', 'section-' + titleSlug);

            }

        });

        return $navElement.prependTo('body');

    }

});

AttireUserRepositories = View.extend({

    initialize: function() {

        this.options = this.$el.data();

        this.$el.html('<p class="loader">Loading...</p>');

        this.$el.whenInViewport(function() {

            this.loadRepos(function(repositories) {

                this.render(this.options.user, shuffleArray(repositories).slice(0, 3));

            });

        }, {threshold: 1000, context: this});

    },

    loadRepos: function(callback) {

        var options = this.options;
        var self = this;

        $.get('https://api.github.com/users/' + options.user + '/repos', function(response) {

            var repositories = $.map(response, function(repo) {

                return repo.has_pages && repo.name !== options.excludeRepo ? {
                    title: repo.name,
                    description: repo.description,
                    url: repo.homepage || repo.html_url
                } : undefined;
            });

            callback && callback.call(self, repositories);

        });

    },

    render: function(userName, repositories) {

        var $list = $('<ul />');

        $.each(repositories, function(i, repo) {
            $list.append(
                '<li>' +
                    '<a class="attireUserRepo" href="' + repo.url + '">' +
                        '<h3 class="title">' + repo.title + '</h3>' +
                        '<p class="description">' + repo.description + '</p>' +
                    '</a>' +
                '</li>'
            );
        });

        this.$el
            .empty()
            .append('<h2 class="title">More from ' + userName + '</h2>')
            .append($list);

    }

});

$(document).ready(function() {
    new AttireController({$el: 'body'});
});
