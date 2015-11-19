// declare app module
var app = angular.module('app-wijmo', ['wj']);

// app controller provides data
app.controller('appCtrl', function appCtrl($scope) {
    // generate some random data
    var countries = 'US,Germany,UK,Japan,Italy,Greece'.split(','),
        data = [];

    for (var i = 0; i < 13; i++) {
        data.push({
            id: i,
            country: countries[i % countries.length],
            date: new Date(2014, i % 12, i % 28),
            amount: Math.random() * 10000,
            active: i % 4 == 0
        });

    }
    // add data array to scope
    $scope.data = data;
});