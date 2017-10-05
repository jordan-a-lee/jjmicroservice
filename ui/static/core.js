// public/core.js
var scotchTodo = angular.module('scotchTodo', []);

function mainController($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all todos and show them
    $http.get('http://localhost:8000/api/address')
        .success(function(data) {
            $scope.addressDatas = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.postAddress = function() {
        $http.post('http://localhost:8000/api/address', $scope.formData)
            .success(function(data) {
              console.log($scope.formData);

                $scope.formData = {}; // clear the form so our user is ready to enter another
                // $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // // delete a todo after checking it
    // $scope.deleteTodo = function(id) {
    //     $http.delete('/api/todos/' + id)
    //         .success(function(data) {
    //             $scope.todos = data;
    //             console.log(data);
    //         })
    //         .error(function(data) {
    //             console.log('Error: ' + data);
    //         });
    // };

    // get address by id
    // $scope.getById = function(id) {
    //     console.log("hey");
    //     $http.get('/api/address/' + id)
    //         .success(function(data) {
    //             $scope.address = data;
    //             console.log(data);
    //         })
    //         .error(function(data) {
    //             console.log('Error: ' + data);
    //         });
    // };
    $scope.getById = function() {
        console.log("hey");
        var id = $scope.addressid
        $http.get('http://localhost:8000/api/address/' + id)
            .success(function(data) {
                $scope.address = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // $http.get('/api/address/'+$scope.formData.addressid)
    //     .success(function(data) {
    //         $scope.address = data;
    //         console.log(data);
    //     })
    //     .error(function(data) {
    //         console.log('Error: ' + data);
    //     });
    $scope.printHey = function() {
        console.log("hey");

    };

}
