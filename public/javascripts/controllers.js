/**
 * Created with JetBrains WebStorm.
 * User: dimkinv
 * Date: 29/04/13
 * Time: 10:58
 * To change this template use File | Settings | File Templates.
 */
//application.socket = io.connect('http://localhost:3000');
application.controller("chatController", function ($scope) {
    var model = {
        loginName: 'anonymous',
        users: [],
        selectedUser: '',
        message: '',
        messageHistory: []
    };
    var socket = io.connect('http://localhost:3000');
    socket.on('broadcast_users', function (users) {
        model.users = users;
        model.selectedUser = users[0];
        $scope.$apply();
    });
    socket.on('send_message_to_clients', function(data){
        model.messageHistory.push(data.text);
        $scope.$apply();
    });

    var events = {
        login: function () {
            socket.emit('user_login', {username: model.loginName})
        },
        send: function () {
             socket.emit('send_message_to_server', {text: model.message})
        }
    };


    $scope.model = model;
    $scope.events = events;
})
;