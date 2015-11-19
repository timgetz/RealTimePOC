(function() {

    var app = angular.module('app', []);

    app.factory('WebSocketService', function ($q, $rootScope) {

        // We return this object to anything injecting our service
        var Service = {};
        // Keep all pending requests here until they get responses
        var callbacks = {};
        // Create a unique callback ID to map requests to responses
        var currentCallbackId = 0;

        var attempts = 1;
        var time = 0;
        var ws = {};

        var initial = {};
        initial['2.5'] = {
            "coupon": 2.5, cellMonth1: {"currentPrice": 100, "cobPrice": 115},
            cellMonth2: {"currentPrice": 100, "cobPrice": 115},
            cellMonth3: {"currentPrice": 100, "cobPrice": 115},
            cellMonth4: {"currentPrice": 100, "cobPrice": 115}
        };
        initial['3.0'] = {
            "coupon": 3.0, cellMonth1: {"currentPrice": 100, "cobPrice": 115},
            cellMonth2: {"currentPrice": 100, "cobPrice": 115},
            cellMonth3: {"currentPrice": 100, "cobPrice": 115},
            cellMonth4: {"currentPrice": 100, "cobPrice": 115}
        };
        initial['3.5'] = {
            "coupon": 3.5, cellMonth1: {"currentPrice": 101, "cobPrice": 115},
            cellMonth2: {"currentPrice": 100, "cobPrice": 115},
            cellMonth3: {"currentPrice": 100, "cobPrice": 115},
            cellMonth4: {"currentPrice": 100, "cobPrice": 115}
        };
        initial['4.0'] = {
            "coupon": 4.0, cellMonth1: {"currentPrice": 100, "cobPrice": 115},
            cellMonth2: {"currentPrice": 100, "cobPrice": 115},
            cellMonth3: {"currentPrice": 100, "cobPrice": 115},
            cellMonth4: {"currentPrice": 100, "cobPrice": 115}
        };
        initial['4.5'] = {
            "coupon": 4.5, cellMonth1: {"currentPrice": 100, "cobPrice": 115},
            cellMonth2: {"currentPrice": 100, "cobPrice": 115},
            cellMonth3: {"currentPrice": 100, "cobPrice": 115},
            cellMonth4: {"currentPrice": 100, "cobPrice": 115}
        };
        initial['5.0'] = {
            "coupon": 5.0, cellMonth1: {"currentPrice": 100, "cobPrice": 115},
            cellMonth2: {"currentPrice": 100, "cobPrice": 115},
            cellMonth3: {"currentPrice": 100, "cobPrice": 115},
            cellMonth4: {"currentPrice": 100, "cobPrice": 115}
        };
        initial['5.5'] = {
            "coupon": 5.5, cellMonth1: {"currentPrice": 100, "cobPrice": 115},
            cellMonth2: {"currentPrice": 100, "cobPrice": 115},
            cellMonth3: {"currentPrice": 100, "cobPrice": 115},
            cellMonth4: {"currentPrice": 100, "cobPrice": 115}
        };

        var changed = {};
        changed['2.5'] = {
            "coupon": 2.5, cellMonth1: {"currentPrice": 99, "cobPrice": 115},
            cellMonth2: {"currentPrice": 99, "cobPrice": 115},
            cellMonth3: {"currentPrice": 99, "cobPrice": 115},
            cellMonth4: {"currentPrice": 99, "cobPrice": 115}
        };
        changed['3.0'] = {
            "coupon": 3.0, cellMonth1: {"currentPrice": 99, "cobPrice": 115},
            cellMonth2: {"currentPrice": 99, "cobPrice": 115},
            cellMonth3: {"currentPrice": 99, "cobPrice": 115},
            cellMonth4: {"currentPrice": 99, "cobPrice": 115}
        };
        changed['3.5'] = {
            "coupon": 3.5, cellMonth1: {"currentPrice": 101, "cobPrice": 115},
            cellMonth2: {"currentPrice": 99, "cobPrice": 115},
            cellMonth3: {"currentPrice": 99, "cobPrice": 115},
            cellMonth4: {"currentPrice": 99, "cobPrice": 115}
        };
        changed['4.0'] = {
            "coupon": 4.0, cellMonth1: {"currentPrice": 99, "cobPrice": 115},
            cellMonth2: {"currentPrice": 99, "cobPrice": 115},
            cellMonth3: {"currentPrice": 99, "cobPrice": 115},
            cellMonth4: {"currentPrice": 99, "cobPrice": 115}
        };
        changed['4.5'] = {
            "coupon": 4.5, cellMonth1: {"currentPrice": 99, "cobPrice": 115},
            cellMonth2: {"currentPrice": 99, "cobPrice": 115},
            cellMonth3: {"currentPrice": 99, "cobPrice": 115},
            cellMonth4: {"currentPrice": 99, "cobPrice": 115}
        };
        changed['5.0'] = {
            "coupon": 5.0, cellMonth1: {"currentPrice": 99, "cobPrice": 115},
            cellMonth2: {"currentPrice": 99, "cobPrice": 115},
            cellMonth3: {"currentPrice": 99, "cobPrice": 115},
            cellMonth4: {"currentPrice": 99, "cobPrice": 115}
        };
        changed['5.5'] = {
            "coupon": 5.5, cellMonth1: {"currentPrice": 99, "cobPrice": 115},
            cellMonth2: {"currentPrice": 99, "cobPrice": 115},
            cellMonth3: {"currentPrice": 99, "cobPrice": 115},
            cellMonth4: {"currentPrice": 99, "cobPrice": 115}
        };



        function createWebSocket() {
            console.log("In createWebSocket.  Attempting to connection... attempts=" + attempts + ", delay time=" + time);
             ws = new WebSocket("ws://localhost:7001/MarketDataServer/dataSocket");

            ws.onopen = function () {
                console.log("Socket has been opened!");
                // reset the tries back to 1 since we have a new connection opened.
                attempts = 1;
                $('#myModal').modal('hide');
            };

            ws.onclose = function () {
                console.log("In onclose");
                time = generateInterval(attempts);

                setTimeout(function () {
                    // We've tried to reconnect so increment the attempts by 1
                    attempts++;
                    $('#myModal').modal('show');

                    // Connection has closed so try to reconnect every 10 seconds.
                    createWebSocket();
                }, time);

            };

            ws.onerror = function (event) {
                console.log("In onerror: Error ", event);
            };

            ws.onmessage = onSocketMessage;
        }

        createWebSocket();

        // generate the interval to a random number between 0 and the maxInterval determined from above
        function generateInterval(k) {
            // If the generated interval is more than 30 seconds, truncate it down to 30 seconds
            return Math.min(30, (Math.pow(2, k) - 1)) * 1000;
        }

        function onSocketMessage(message) {

            //listener(JSON.parse(message.data));

            if (message.data) {
                console.log("In onSocketMessage: message= ", message.data);
                listener(JSON.parse(message.data));
            }

        };

        function sendRequest(request) {
            var defer = $q.defer();
            var callbackId = getCallbackId();
            callbacks[callbackId] = {
                time: new Date(),
                cb: defer
            };
            request.callback_id = callbackId;
            console.log('Sending request', request);
            ws.send(JSON.stringify(request));
            return defer.promise;
        }

        function listener(data) {

            var receivedFeed = data;
            console.log("Received data from websocket: ", receivedFeed);
            if (receivedFeed.action === "add") {

                $rootScope.$broadcast('websocketMsg', receivedFeed.data);

                //TODO: THIS NEEDS TO BE INCORPORATED... RIGHT NOW I'M NOT PASSING THE CALLBACK_ID
                // If an object exists with callback_id in our callbacks object, resolve it
//                if (callbacks.hasOwnProperty(receivedFeed.callback_id)) {
//                    console.log(callbacks[receivedFeed.callback_id]);
////                    $rootScope.$apply(callbacks[receivedFeed.callback_id].cb.resolve(receivedFeed.data));
//                    $rootScope.$apply(callbacks[receivedFeed.callback_id].cb.resolve(angular.copy(receivedFeed.data)));
//                    delete callbacks[receivedFeed.callback_id];
//                }

                //TODO: THIS IS CALLING THE CONTROLLER FROM THE FACTORY, IT SHOULD BE THE OTHERWAY AROUND SINCE THE CONTROLLER LIVES AND DIES, FACTORY ALWAYS LIVES
                //var scope = angular.element(document.getElementById("MainWrap")).scope();
                //scope.setStagedProductData(receivedFeed.adjustedPrices);
                //scope.updateStagedData();
                //scope.$apply(function () {
                //    scope.updateStagedData();
                //})

            }

        }

        // This creates a new callback ID for a request
        function getCallbackId() {
            currentCallbackId += 1;
            if (currentCallbackId > 10000) {
                currentCallbackId = 0;
            }
            return currentCallbackId;
        }

        // Define a "getter" for getting customer data
        Service.getCustomers = function () {
            var request = {
                type: "get_customers"
            }
            // Storing in a variable for clarity on what sendRequest returns
            var promise = sendRequest(request);
            return promise;
        }

        Service.getProductData = function () {

            var request = {
                type: "get_customers"
            }

            // Wait until the state of the socket is not ready and send the message when it is...
            waitForSocketConnection(ws, function(){
                console.log("message sent!!!");
                var promise = sendRequest(request);
                return promise;
                //return angular.copy(initial);
            });

            // Make the function wait until the connection is made...
            function waitForSocketConnection(socket, callback){
                setTimeout(
                    function () {
                        if (socket.readyState === 1) {
                            console.log("Connection is made")
                            if(callback != null){
                                callback();
                            }
                            return;

                        } else {
                            console.log("wait for connection...")
                            waitForSocketConnection(socket, callback);
                        }

                    }, 5); // wait 5 milisecond for the connection...
            }



        }

        return Service;
    });

    app.controller('AppCtrl', function ($scope, WebSocketService) {
        var vm = this;
        $scope.productGrid = {};

        $scope.stagedProductGrid = {};
        $scope.customParams = {};

        $scope.setStagedProductData = function (data2) {
            $scope.stagedProductGrid = data2;
        }

        //Called from websockets.
        $scope.updateStagedData = function () {
            var newData2 = $scope.stagedProductGrid;
            for (var key in newData2) {
                var couponCell = newData2[key];

                var couponToModify = vm.productGrid[couponCell.coupon];
                couponToModify.cellMonth1.currentPrice = couponCell.month1;
                couponToModify.cellMonth2.currentPrice = couponCell.month2;
                couponToModify.cellMonth3.currentPrice = couponCell.month3;
                couponToModify.cellMonth4.currentPrice = couponCell.month4;
            }
        };

        WebSocketService.getProductData();
        //    .then(function(promise1) {
        //    console.log("promise1="+promise1);
        //    vm.productGrid = angular.copy(promise1);
        //    //vm.productGrid = promise1;
        //});

        //$scope.$on('websocketMsg', function(event,data) {
        //    console.log("data="+data);
        //    $scope.productGrid = angular.copy(data);
        //
        //})

        vm.productGrid = angular.copy(initial);

        //vm.productGrid = angular.copy(initial);

        //vm.loadData = function loadData() {
        //    vm.productGrid = angular.copy(changed);
        //};

        vm.changeValue = function changeValue() {
            vm.productGrid[0].month1 = 99;
        };

        vm.revert = function revert() {
            vm.productGrid = angular.copy(initial);
        };
    });

    app.directive('highlighter', function ($timeout) {
        return {
            restrict: 'A',
            scope: {
                model: '=highlighter'
            },
            link: function (scope, element) {
                scope.$watch(
                    'model',
                    function (newVal, oldVal) {


                        if (newVal.currentPrice > newVal.cobPrice) {
                            element.addClass('highlight-cob-up');
                            element.removeClass('highlight-cob-down');
                        } else if (newVal.currentPrice < newVal.cobPrice) {
                            element.addClass('highlight-cob-down');
                            element.removeClass('highlight-cob-up');
                        } else {
                            element.removeClass('highlight-cob-up');
                            element.removeClass('highlight-cob-down');
                        }

                        if (newVal.currentPrice > oldVal.currentPrice) {
                            // apply class
                            //$('#lblName').closest('tr').index();
                            element.addClass('highlight-up');

                            // auto remove after some delay
                            $timeout(function () {
                                element.removeClass('highlight-up');
                            }, 2000);
                        } else if (newVal.currentPrice < oldVal.currentPrice) {
                            // apply class
                            element.addClass('highlight-down');

                            // auto remove after some delay
                            $timeout(function () {
                                element.removeClass('highlight-down');
                            }, 2000);
                        }

                    }, true
                );
            }
        };
    });

}());