var $ = require('jquery');
var View = require('jquery-simple-view');
var BaseController = require('../common/baseController');
var AttireUserRepositories = require('../common/userRepositories');
var slugify = require('slugify');

var AttireController;
var AttireNavigation;

AttireController = BaseController.extend({

    initialize: function() {

        this.addView(new AttireNavigation());
        this.setupCodeHighlight();
        this.setupAttireQueue();
        this.mapView('.attireUserRepositories', AttireUserRepositories);

    }

});

AttireNavigation = View.extend({

    initialize: function() {

        this.$el = this.setupElement();

    },

    events: {
        'click > .toggleBtn': function(e) {
            this.$el.toggleClass('isActive');
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
                var titleSlug = slugify(title);

                $('<li><a href="#section-' + titleSlug + '">' + title + '</a></li>').appendTo($navList);
                $attireBlock.attr('id', 'section-' + titleSlug);

            }

        });

        return $navElement.prependTo('body');

    }

});

$(document).ready(function() {
    new AttireController({$el: 'body'});
});
