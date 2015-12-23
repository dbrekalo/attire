var attire = {

    init: function() {

        this.setupNavigation().events();

    },

    events: function() {

        $('.attireMainNav').on('click', '.toggleBtn', function(e) {

            $(e.delegateTarget).toggleClass('isActive');

        });

        $('.attireCodeToggleBlock').on('click', '.attireCodeToggleBtn', function(e) {

            $(e.delegateTarget).toggleClass('isActive');

        });

        return this;

    },

    setupNavigation: function() {

        if ($('.attireMainNav').length) {
            return;
        }

        var $navElement = $(
                '<nav class="attireMainNav">' +
                    '<ul></ul>' +
                    '<button class="toggleBtn iconMenu" type="button">Toggle navigation</button>' +
                '</nav>'
            ),
            $navList = $navElement.find('ul');

        $('.attireBlock').each(function(i, attireBlock) {

            var $attireBlock = $(attireBlock),
                $title =  $attireBlock.find('h1,h2,h3,h4,h5').first();

            if ($title.length) {

                var title = $title.data('nav-title') || $title.text(),
                    slug = window.slug(title, {lower:true});

                $('<li><a href="' + '#section-' + slug + '">' + title + '</a></li>').appendTo($navList);
                $attireBlock.attr('id', 'section-' + slug);

            }

        });

        $('body').prepend($navElement);

        return this;

    }

};

$(document).ready(function() {

    attire.init();

});
