var $ = require('jquery');
var View = require('jquery-simple-view');
var BaseController = require('../common/baseController');
var AttireUserRepositories = require('../common/userRepositories');
var Fuse = require('fuse.js');
var WhenInViewport = require('when-in-viewport');
var throttle = require('throttle-debounce/throttle');

require('fastsearch');
require('nanoscroller');

var AttireController;
var AttireNavigation;
var AttireSearch;

AttireController = BaseController.extend({

    initialize: function() {

        var self = this;

        this.setupCodeHighlight();
        this.setupAttireQueue();

        var navigation = this.mapView('.attireNav', AttireNavigation, {
            onPageChange: function() {
                self.setupCodeHighlight();
            }
        });

        this.mapView('.attireSearch', AttireSearch, {
            onItemSelect: function(item) {
                navigation.openLink(item.url, item.pointer, true);
            },
            getSearchableItems: function() {
                return navigation.getSearchableNavItems();
            }
        });

        this.mapView('.attireUserRepositories', AttireUserRepositories);

    }

});

AttireNavigation = View.extend({

    initialize: function(options) {

        this.options = options;

        $('<div class="overlay" />').prependTo(this.$el);

        this.currentPageSlug = $('.attireArticle').data('slug');
        this.$navElements = this.$('.docLink');

        this.connectNav = throttle(250, $.proxy(this.connectNav, this));

        this.buildNavRegistry();
        this.connectNav();

        if (Boolean('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch) === false) {
            this.setupStyledScrollBar();
        }

    },

    events: {
        'click > .toggleBtn': 'toggle',
        'click > .overlay': 'close',
        'click > .closeBtn': 'close',
        'click .docLink': 'openDocLink',
        'scroll window': 'connectNav',
        'popstate window': function(e) {

            var state = e.originalEvent.state;

            if (state && state.pointer) {
                e.preventDefault();
                this.openLink(state.url, state.pointer);
            }

        }
    },

    toggle: function() {

        this.$el.hasClass('opened') ? this.close() : this.open();

    },

    connectNav: function() {

        this.$window = this.$window || $(window);

        var currentScrollPosition = this.$window.scrollTop();
        var self = this;

        $.each(self.navRegistry, function(index, item) {

            if (currentScrollPosition < item.offset) {

                self.$navElements.removeClass('selected');
                item.$navElement.addClass('selected');

                return false;
            }

        });

    },

    openDocLink: function(e) {

        e.preventDefault();

        var $link = $(e.currentTarget);
        var url = $link.attr('href');
        var pointer = $link.attr('data-pointer');

        this.openLink(url, pointer, true);

    },

    openLink: function(url, pointer, adjustHistory) {

        if (adjustHistory && window.history.pushState) {
            window.history.pushState({
                pointer: pointer,
                url: url
            }, null, url);
        }

        var pointerParts = pointer.split('#');
        var pageSlug = pointerParts[0];
        var sectionTitleId = pointerParts[1];

        if (pageSlug === this.currentPageSlug) {
            this.scrollTo($('#' + sectionTitleId));
            this.close();
        } else {
            this.loadPage(url, function() {
                this.scrollTo($('#' + sectionTitleId));
                this.close();
            });
        }

    },

    loadPage: function(url, callback) {

        var self = this;

        return $.get(url, function(html) {

            var $pageHtml = $(html);
            var $newArticle = $pageHtml.filter('.attireArticle');
            var title = $pageHtml.filter('title').text();

            window.document.title = title;
            self.currentPageSlug = $newArticle.data('slug');
            $('.attireArticle').replaceWith($newArticle);

            self.buildNavRegistry();
            self.connectNav();

            callback && callback.call(self);

            if (self.options && self.options.onPageChange) {
                self.options.onPageChange();
            }

            WhenInViewport.checkAll();

        });

    },

    buildNavRegistry: function() {

        var self = this;

        this.navRegistry = [];

        $('.attireArticle h1, .attireArticle h2').each(function(index, title) {

            var $title = $(title);

            self.navRegistry.push({
                $title: $title,
                $navElement: self.$navElements.filter('[data-pointer="' + self.currentPageSlug + '#' + $title.attr('id') + '"]').eq(0),
                offset: $title.offset().top
            });
        });

        return this;

    },

    scrollTo: function($element) {

        $('html, body').animate({
            scrollTop: $element instanceof $ ? $element.offset().top - 100 : $element
        }, 300);

    },

    getSearchableNavItems: function() {

        return this.$navElements.map(function(i, navEl) {

            var $navEl = $(navEl);
            var sectionText;
            var text = $navEl.text();
            var html = text;

            if ($navEl.parent().is('li')) {
                sectionText = $navEl.closest('ul').prev().text();
                text += ' ' + sectionText;
                html += ' <span>' + sectionText + '</span>';
            }

            return {
                url: $navEl.attr('href'),
                pointer: $navEl.data('pointer'),
                text: text,
                html: html
            };

        }).get();

    },

    open: function() {

        if (!this.$closeBtn) {
            this.$closeBtn =
                $('<button class="closeBtn nBtn iconCross" type="button">Close navigation</button>')
                .appendTo(this.$el);
        }

        $('body').addClass('navOpened');
        this.$el.addClass('opened');

    },

    close: function() {

        $('body').removeClass('navOpened');
        this.$el.removeClass('opened');

    },

    setupStyledScrollBar: function() {

        var $scrollPanel = this.$('.panel').addClass('nano');
        $scrollPanel.children().addClass('nano-content');

        $scrollPanel.nanoScroller();

    }

});

AttireSearch = View.extend({

    initialize: function(options) {
        this.options = options;
    },

    events: {
        'one:click input': 'setupSearch'
    },

    setupSearch: function() {

        var self = this;
        var $input = this.$('input');
        var Fastsearch = $.fastsearch;
        var fuse = new Fuse(self.options.getSearchableItems(), {keys: ['text'], threshold: 0.4});

        var fastsearch = new Fastsearch($input, {
            wrapSelector: '.attireSearch',
            responseFormat: {label: 'html'},
            typeTimeout: 0,
            focusFirstItem: true,
            preventSubmit: true,
            onItemSelect: function($item, model) {
                self.options.onItemSelect(model);
                fastsearch.clear();
            }
        });

        fastsearch.getResults = function(callback) {

            callback(fuse.search($input.val()));

        };

    }

});

$(document).ready(function() {
    new AttireController({$el: 'body'});
});
