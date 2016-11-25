/**
 * Created by Hosoya on 25/11/16.
 */
// app.js

var kurentoApp = angular.module('kurentoApp', ['ui.router']);
kurentoApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('login', {
            url: '/login',
            templateUrl: './app/pages/login/login.html'
        })

        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('about', {
            // we'll get to this in a bit
        });

});