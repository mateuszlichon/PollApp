$(function () {
    var ajax = new Ajax();
    var formUtil = new FormUtil();
    var ongoingPolls = $('#ongoingPolls');
    var closedPolls = $('#closedPolls');
    var closedPollsCategories = $('#closedPollsCategories');
    var openPollsCategories = $('#openPollsCategories');
    var showPolls = $('#showPolls');
    var pollForm = $('#pollForm');
    var answers = $('#answers');
    var categories = $('#all-categories');
    var selectedCategories = $('#selected-categories');
    var $pagination = $('.pagination-polls');
    var categoryId = 0;
    var showPollsAddress = "";
    var pollSortProperty = "created";
    var pollSortDirection = "desc";
    var registerForm = $('#register-form');
    var loginForm = $('#login-form');

    var defaultOpts = {
        totalPages: 10,
        visiblePages: 5,
        startPage: 1
    };
    $pagination.twbsPagination(defaultOpts);

    function createCommentInfoLink(commentsAmount, pollId) {
        return '<div class="container text-right toggle-comments">' +
            '<a class="btn" data-poll=' + pollId + '>Comments (' + commentsAmount + ')</a></div>'
    }

    function renderClosedList(endpoint) {
        ajax.ajaxGetCallback(endpoint, function (response) {
            var totalPages = response.totalPages;
            if (totalPages <= 0) {
                totalPages = 1;
            }
            $pagination.twbsPagination('destroy');
            $pagination.twbsPagination($.extend({}, defaultOpts, {
                totalPages: totalPages,
                onPageClick: function (evt, page) {
                    closedPolls.empty();
                    var param = '?page=' + (page - 1);
                    if (endpoint.includes('?')) {
                        param = '&page=' + (page - 1);
                    }
                    ajax.ajaxGetCallback(endpoint + param, function (response) {
                        var data = response.content;
                        data.forEach(function (elem) {
                            var poll = elem.poll;
                            var pollData = elem.pollNumberData;
                            var charContent = [];
                            ajax.ajaxGetCallback('/polls/' + poll.id + '/answers', function (response) {
                                response.forEach(function (elem) {
                                    var answer = elem.answer;
                                    var answerData = elem.answerNumberData;
                                    charContent.push({
                                        y: answerData.percent,
                                        label: answer.content
                                    })
                                });
                                closedPolls.append('<div class="card border-danger mb-3" style="max-width: 40rem;">' +
                                    '<div class="card-header">' +
                                    poll.question +
                                    '</div>' +
                                    '<div class="card-body">' +
                                    '<div id="chartContainer' + poll.id + '" data-id="' + poll.id + '" style="height: 370px; width: 100%;"></div>' +
                                    '</div>' +
                                    createCommentInfoLink(pollData.comments, poll.id) +
                                    '<div class="container comments hidden p-2"></div>' +
                                    '<div class="pager-comments hidden">' +
                                    '<ul class="pagination-comments pagination-sm"></ul></div>' +
                                    '</div>');
                                var chart = new CanvasJS.Chart("chartContainer" + poll.id, {
                                    animationEnabled: true,
                                    theme: "light2", // "light1", "light2", "dark1", "dark2"
                                    title: {
                                        text: ""
                                    },
                                    axisY: {
                                        title: "%"
                                    },
                                    data: [{
                                        type: "column",
                                        showInLegend: true,
                                        legendMarkerColor: "grey",
                                        legendText: pollData.totalAnswers + " answers",
                                        dataPoints: charContent
                                    }]
                                });
                                chart.render();
                            });
                        })
                    });
                }
            }));
        });
    }

    function renderOpenedList(endpoint) {
        ongoingPolls.empty();
        ajax.ajaxGetCallback(endpoint, function (response) {
            var content = response.content;
            content.forEach(function (elem) {
                var poll = elem.poll;
                var pollAnswers = '';
                ajax.ajaxGetCallback('/polls/' + poll.id + '/answers', function (response) {
                    response.forEach(function (elem) {
                        var answer = elem.answer;
                        pollAnswers += '<div class="form-check">' +
                            '<label class="form-check-label">' +
                            '<input type="radio" class="form-check-input" name="optionsRadios" value="' + answer.id + '" checked="">' +
                            answer.content +
                            '</label>' +
                            '</div>'
                    });

                    ongoingPolls.append('<div class="text-white bg-secondary mb-3" style="max-width: 40rem;"><div class="card-header">' +
                        poll.question + '<br\>' +
                        '</div><div class="card-body">' +
                        '<fieldset class="form-group">' +
                        pollAnswers +
                        '</fieldset>' +
                        '</div><div class="card-header">' +
                        '<div>Time left:</div>' +
                        '<div id="clock' + poll.id + '"></div>' +
                        '</div></div>');

                    var getClock = setInterval(function () {
                        var now = new Date().getTime();
                        var closed = poll.closed;
                        var distance = closed - now;
                        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        var clock = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';
                        if (document.getElementById("clock" + poll.id) !== null) {
                            document.getElementById("clock" + poll.id).innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
                        }
                    }, 1000);
                });
            })
        });
    }

    function renderCategoriesList() {
        openPollsCategories.append('<a class="dropdown-item category-open" data-category="' + "0" + '" href="#">' + "All" + '</a>');
        closedPollsCategories.append('<a class="dropdown-item category-closed" data-category="' + "0" + '" href="#">' + "All" + '</a>');
        ajax.ajaxGetCallback('/categories', function (response) {
            response.forEach(function (category) {
                openPollsCategories.append('<a class="dropdown-item category-open" data-category="' + category.id + '" href="#">' + category.name + '</a>');
                closedPollsCategories.append('<a class="dropdown-item category-closed" data-category="' + category.id + '" href="#">' + category.name + '</a>');
            })
        });
    }

    function renderCategoriesToSelect() {
        ajax.ajaxGetCallback('/categories', function (response) {
            response.forEach(function (category) {
                categories.append('<li data-id="' + category.id + '" class="col-xs-3 list-group-item"> ' + category.name + '</li>')
            })
        });
    }

    function renderAnswers() {
        var answer = answers.children().last();
        answers.empty();
        answers.append(answer);
        answer.clone().appendTo(answers);
    }

    showPolls.on('click', function (e) {
        showPollsAddress = $(e.target).data('address');
        renderClosedList('/categories/' + categoryId + '/polls/' + showPollsAddress + '?sort=' + pollSortProperty + '&dir=' + pollSortDirection);
        $('#showPollsButton').html($(e.target).html() + ' POLLS');
    });

    closedPollsCategories.on('click', function (e) {
        categoryId = $(e.target).data('category');
        var categoryName = $(e.target).html();
        renderClosedList('/categories/' + categoryId + '/polls/' + showPollsAddress + '?sort=' + pollSortProperty + '&dir=' + pollSortDirection);
        $('#closedPollsCategoryButton').html('CATEGORY ' + categoryName);
    });

    $('#showPollsSort').on('click', function (e) {
        pollSortProperty = $(e.target).data('sort');
        pollSortDirection = $(e.target).data('direction');
        var sortName = $(e.target).html();
        renderClosedList('/categories/' + categoryId + '/polls/' + showPollsAddress + '?sort=' + pollSortProperty + '&dir=' + pollSortDirection);
        $('#showPollsSortButton').html(sortName);
    });

    openPollsCategories.on('click', function (e) {
        categoryId = $(e.target).data("category");
        var categoryName = $(e.target).html();
        renderOpenedList('/categories/' + categoryId + '/polls/available');
        $('#ongoingPollsCategoryButton').html('CATEGORY ' + categoryName);
    });

    pollForm.on('submit', function (e) {
        e.preventDefault();
        pollForm.find('.text-success').remove();
        pollForm.find('.text-danger').remove();
        var poll = formUtil.createObjectFromForm($('#poll'));
        var answers = $('#answers').children();
        var days = parseInt($('#days').children().first().val());
        var hours = parseInt($('#hours').children().first().val());
        var valid = true;
        if (isNaN(hours)) {
          hours = 0;
        }
        if (isNaN(days)) {
          days = 0;
        }
        if (days + hours === 0) {
          days = 1;
          hours = 0;
        }
        var closeDate = new Date();
        closeDate.setDate(closeDate.getDate() + days);
        closeDate.setHours(closeDate.getHours() + hours);
        poll.closed = closeDate;
        ajax.ajaxPostCallback("/polls", poll, function (response) {
            if (response.status !== 'OK') {
                valid = false;
                $.each(response.errors, function (key, value) {
                    pollForm.find('#' + key).parent().append('<p class="text-danger">' + value + '</p>');
                });
            } else {
                $('#selected-categories').children().each(function (index, category) {
                    ajax.ajaxPost("/polls/" + response.pollId + "/categories/" + $(category).data('id'))
                });
                ajax.ajaxPost("/polls/" + response.pollId + "/closed/0" + days + "/0" + hours);
            }
            answers.each(function (index, elem) {
                var answer = {content: $(elem).val()};
                ajax.ajaxPostCallback("/polls/" + response.pollId + "/answers", answer, function (response) {
                    if (response.status !== 'OK') {
                        valid = false;
                        $.each(response.errors, function (key, value) {
                            $(elem).after('<p class="text-danger">' + value + '</p>');
                        });
                    } else if (valid === false) {
                        ajax.ajaxDelete('/answers/' + response.answerId);
                    }
                });
            });
            if (valid === true) {
                categories.empty();
                selectedCategories.empty();
                renderCategoriesToSelect();
                pollForm.trigger('reset');
                pollForm.append('<p class="text-success">' + response.successMsg + '</p>')
                renderOpenedList('/categories/' + 0 + '/polls/available');
                pollForm.toggle('hidden');
            } else {
                if (response.pollId !== 0) {
                    ajax.ajaxDelete('/polls/' + response.pollId);
                }
            }
        });
    });

    $('#pollCreate').on('click', function () {
        pollForm.toggle('hidden');
        categories.empty();
        selectedCategories.empty();
        renderCategoriesToSelect();
        pollForm.find('.text-success').remove();
        pollForm.find('.text-danger').remove();
    });

    categories.on('click', 'li', function (e) {
        selectedCategories.append(e.target);
    });

    selectedCategories.on('click', 'li', function (e) {
        categories.append(e.target);
    });

    $('.add-answer').on('click', function () {
        answers.find('input').first().clone().appendTo(answers).val('');
    });

    $('.remove-answer').on('click', function () {
        if (answers.find('input').length > 2) {
            var answer = answers.find('input').last();
            answer.next().remove();
            answer.remove();
        }
    });

    $('#PollAppBtn').on('click', function() {
      renderOpenedList('/categories/' + 0 + '/polls/available');
      renderClosedList('/polls/closed');
    });

    ongoingPolls.on('click', '.form-check-input', function (e) {
        ajax.ajaxPost('/answers/' + e.target.value + '/data');
        $(this).parents('.text-white').fadeOut();
    });

    $('#register').on('click', function () {
        registerForm.toggle('hidden');
        registerForm.trigger('reset');
        registerForm.find('.text-success').remove();
        registerForm.find('.text-danger').remove();
    });

    registerForm.on('submit', function (e) {
        e.preventDefault();
        registerForm.find('.text-success').remove();
        registerForm.find('.text-danger').remove();
        var account = formUtil.createObjectFromForm($('#register-form'));
        ajax.ajaxPostCallback("/accounts", account, function (response) {
            if (response.status === 'OK') {
                registerForm.append('<p class="text-success">' + response.successMsg + '</p>');
            } else {
                $.each(response.errors, function (key, value) {
                    registerForm.find('#' + key).parent().append('<p class="text-danger">' + value + '</p>');
                });
            }
        });
        this.reset();
    });

    $('#login').on('click', function () {
        removeLoginError();
        loginForm.submit();
    });

    $(window).on('beforeunload', function () {
        removeLoginError();
    });

    function handleLoginError() {
        if (Cookies.get('logged_error') !== undefined) {
            $('#login-error').text('Invalid credentials');
        }
    }

    function removeLoginError() {
        $('#login-error').remove();
        Cookies.remove('logged_error');
    }

    function renderComments(elem, pollId) {
        var commentPager = elem.siblings('.pager-comments').find('.pagination-comments');
        ajax.ajaxGetCallback('/polls/' + pollId + '/comments', function (response) {
            var totalPages = response.totalPages;
            if (totalPages <= 0) {
                totalPages = 1;
            }
            commentPager.twbsPagination('destroy');
            commentPager.twbsPagination($.extend({}, defaultOpts, {
                totalPages: totalPages,
                onPageClick: function (evt, page) {
                    elem.empty();
                    ajax.ajaxGetCallback('/polls/' + pollId + '/comments?page=' + (page - 1), function (response) {
                        var comments = response.content;
                        comments.forEach(function (comment) {
                            var date = new Date(comment.created).toLocaleString();
                            $(elem).append('<div class="container">' +
                                '<div class="card">' +
                                '<div class="card-header">' +
                                '<strong>' + comment.userAccount.username + " commented on " + date + '</strong>' +
                                '</div>' +
                                '<div class="card-body">' +
                                '<span class="card-text">' + comment.content + '</span>' +
                                '</div>' +
                                '</div>')
                        })
                    });

                }
            }));

        });
    }

    closedPolls.on('click', '.toggle-comments', function (e) {
        var comments = $(e.target).parent().siblings('.comments');
        var pollId = $(e.target).data("poll");
        comments.toggle('hidden');
        comments.siblings('.pager-comments').toggle('hidden');
        renderComments(comments, pollId);

    });

    function toggleAuthors() {
      var now = new Date();
      if (now.getMilliseconds() % 2 == 0) {
        $('#authorScenarioA').hide();
      } else {
        $('#authorScenarioB').hide();
      }
    }

    $('#showApplication').on('click', function () {
      $('.appDescription').hide();
      $('.appDescription').toggle('hidden');
    });

    $('#showStatement').on('click', function () {
      $('.appDescription').hide();
      $('#statement').toggle('hidden');
    });

    $('#showTechnologies').on('click', function () {
      $('.appDescription').hide();
      $('#technologies').toggle('hidden');
    });

    $('#showAuthors').on('click', function () {
      $('.appDescription').hide();
      $('#authors').toggle('hidden');
    });

    renderCategoriesList();
    renderOpenedList('/categories/' + 0 + '/polls/available');
    renderClosedList('/polls/closed');
    handleLoginError();
    toggleAuthors();

});
