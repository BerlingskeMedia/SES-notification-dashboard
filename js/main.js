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
    .when("/", {templateUrl: "partials/home.html", controller: "PageCtrl"})
    // Pages
    .when("/about", {templateUrl: "partials/about.html", controller: "PageCtrl"})
    .when("/faq", {templateUrl: "partials/faq.html", controller: "PageCtrl"})
    .when("/pricing", {templateUrl: "partials/pricing.html", controller: "PageCtrl"})
    .when("/services", {templateUrl: "partials/services.html", controller: "PageCtrl"})
    .when("/bounces", {templateUrl: "partials/bounces.html", controller: "BounceCtrl"})
    .when("/contact", {templateUrl: "partials/contact.html", controller: "PageCtrl"})
    // Blog
    .when("/blog", {templateUrl: "partials/blog.html", controller: "BlogCtrl"})
    .when("/blog/post", {templateUrl: "partials/blog_item.html", controller: "BlogCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);

/**
 * Controls the Blog
 */
app.controller('BlogCtrl', function (/* $scope, $location, $http */) {
  console.log("Blog Controller reporting for duty.");
});

/**
 * Controls the Bounces
 */
app.controller('BounceCtrl', function (/* $scope, $location, $http */) {
  console.log("Bounce Controller reporting for duty.");

  $('#bounce-table').DataTable();

  $('#load-more').click(function() {
    $(this).prop('disabled', true);
    $.ajax({
      url: "api/getBounces",
      data: {
        'lastEvalKey': $(this).attr('lastEvalKey'),
      },
      success: function(result){
        $('#load-more').prop('disabled', false);
        $("#bounce-table").DataTable().rows.add(result['data']).draw();

        if (result['lastEvalKey']) {
          $('#load-more').attr('lastEvalKey',JSON.stringify(result['lastEvalKey']));
        } else {
          $('#load-more').prop('disabled', true);
          $('#load-more').removeAttr('lastEvalKey');
          $('#load-more').val('No more to load');
        }
    }});
  });

});

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