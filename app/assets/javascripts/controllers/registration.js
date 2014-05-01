'use strict';

/** Controllers */
angular.module('sseChat.controllers', ['sseChat.services'])
    .controller('ChatCtrl', function ($scope, $http, chatModel) {
        $scope.streams = chatModel.getStreams();
        $scope.msgs = [];
        $scope.inputText = "";
        $scope.user = "Jane Doe #" + Math.floor((Math.random() * 100) + 1);
        $scope.currentStream = $scope.streams[0];

        /** change current streams, restart EventSource connection */
        $scope.setCurrentStream = function (stream) {
            $scope.currentStream = stream;
            $scope.chatFeed.close();
            $scope.msgs = [];
            $scope.listen();
        };

        /** posting chat text to server */
        $scope.submitMsg = function () {
            $http.post("/chat", { text: $scope.inputText, user: $scope.user,
                time: (new Date()).toUTCString(), stream: $scope.currentStream.value });
            $scope.inputText = "";
        };

        /** handle incoming messages: add to messages array */
        $scope.addCircle = function (msg) {
            $scope.$apply(function () { $scope.msgs.push(JSON.parse(msg.data)); });
        };

        /** start listening on messages from selected streams */
        $scope.listen = function () {
            $scope.chatFeed = new EventSource("/chatFeed/registration");
            $scope.chatFeed.addEventListener("registration", $scope.addCircle, false);
        };

        $scope.listen();
    });
