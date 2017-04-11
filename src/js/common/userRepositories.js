var $ = require('jquery');
var View = require('jquery-simple-view');
var shuffleArray = require('shuffle-array');

module.exports = View.extend({

    initialize: function() {

        this.options = $.extend({}, this.$el.data());

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

            var currentRepoUrl = $('link[rel="canonical"]').attr('href');
            var currentRepoName = currentRepoUrl ? $.map(currentRepoUrl.split('/'), function(part) {
                return part ? part : undefined;
            }).slice(-1)[0] : undefined;

            var repositories = $.map(response, function(repo) {

                var includeRepo =
                    (options.onlyWithPages ? repo.has_pages : true) &&
                    (options.excludeRepo ? options.excludeRepo.split(',').indexOf(repo.name) < 0 : true) &&
                    (currentRepoName ? currentRepoName !== repo.name : true);

                return includeRepo ? {
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
