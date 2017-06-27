var mainApp = angular.module('mainApp', []);

console.log("CONTROLLER.JS LOADED");
mainApp.controller('mainCtrl', function($scope) {

});

mainApp.controller('avgCtrl', function($scope) {
	//$scope.average = ((+$scope.game1) + (+$scope.game2) + (+$scope.game3));
	$scope.average = "12345";
});