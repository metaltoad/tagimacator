'use strict';

var app = angular.module('tagimacatorApp', [
  'ngRoute',
  'tagimacator'
]);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/docs', {
      templateUrl: 'views/docs.html',
      controller: 'MainCtrl'
    })
    .when('/demos', {
      templateUrl: 'views/demos.html',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});