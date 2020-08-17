/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('tutorialWebApp', [
    'ngRoute'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    // Home
        .when("/", {
            templateUrl: "partials/bounces.html",
            controller: "BounceCtrl"
        })
        // Pages
        .when("/about", {
            templateUrl: "partials/about.html",
            controller: "PageCtrl"
        })
        .when("/bounces", {
            templateUrl: "partials/bounces.html",
        })
        .when("/complaints", {
            templateUrl: "partials/complaints.html",
        })
        // else 404
        .otherwise("/404", {
            templateUrl: "partials/404.html",
            controller: "PageCtrl"
        });
}]);

/**
 * Controls the Bounces
 */
app.controller('BounceCtrl', function ( $scope, $filter/*, $location, $http */) {
    console.log("Bounce Controller reporting for duty.");

    $('#bounce-table').DataTable();
    const currentDate = new Date();
    $scope.date_from = $filter("date")(new Date(currentDate.setMonth(currentDate.getMonth()-1)), 'yyyy-MM-dd');
    $scope.date_to = $filter("date")(Date.now(), 'yyyy-MM-dd');
});

app.directive('bounceTable', [ '$timeout', function($timeout) {
    return function(scope, element, attrs) {
        $timeout(function (){
            search();
            loadMore();
            console.log('JS included')
        }, 500, false);
    };
}]);

function loadMore(url) {
    $('#load-more').click(function () {
        $(this).prop('disabled', true);
        $.ajax({
            url: url || "api/getBounces",
            data: {
                'lastEvalKey': $(this).attr('data-lastEvalKey'),
                'appliedFilters': $(this).attr('data-appliedFilters')
            },
            success: function (result) {
                $('#load-more').prop('disabled', false);
                $("#bounce-table").DataTable().rows.add(result['data']).draw();

                if (result['lastEvalKey']) {
                    $('#load-more').attr('data-lastEvalKey', JSON.stringify(result['lastEvalKey']));
                }
                else {
                    $('#load-more').prop('disabled', true);
                    $('#load-more').removeAttr('data-lastEvalKey');
                    $('#load-more').val('No more to load');
                }
            }
        });
    });
}
function search() {
    $('#search').click(function () {

        var filters = $('.search-filter').filter(function () {
            if ($(this).val()) {
                return true;
            }
        }).serialize();

        $('#load-more').val('Load');
        $('#load-more').prop('disabled', false);
        $('#load-more').attr('data-lastevalkey', '');
        $('#load-more').attr('data-appliedFilters', filters);

        $('#bounce-table').DataTable().clear();
        $('#bounce-table').DataTable().draw();
        $('#load-more').click();

    });
}

/**
 * Controls the Complaints
 */
app.controller('ComplaintCtrl', function ( $scope, $filter/*$location, $http */) {
    console.log("Complaint Controller reporting for duty.");

    $('#bounce-table').DataTable();

    const currentDate = new Date();
    $scope.date_from = $filter("date")(new Date(currentDate.setMonth(currentDate.getMonth()-1)), 'yyyy-MM-dd');
    $scope.date_to = $filter("date")(Date.now(), 'yyyy-MM-dd');

});

app.directive('complaintTable', [ '$timeout', function($timeout) {
    return function(scope, element, attrs) {
        $timeout(function (){
            search();
            loadMore('api/getComplaints');
            console.log('JS included')
        }, 500, false);
    };
}]);

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function (/* $scope, $location, $http */) {
    console.log("Page Controller reporting for duty.");

    // Activates the Carousel
    $('.carousel').carousel({
        interval: 5000
    });

    // Activates Tooltips for Social Links
    $('.tooltip-social').tooltip({
        selector: "a[data-toggle=tooltip]"
    })
});
