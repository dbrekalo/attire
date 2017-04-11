var $ = window.$ = window.jQuery = require('jquery');
var View = require('jquery-simple-view');

require('console-polyfill');
require('when-in-viewport');

module.exports = View.extend({

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
