/**
 * Created by Hosoya on 25/11/16.
 */
function loginCtrl ($scope, $state, $stateParams) {
    var ws = $stateParams.ws;

    $scope.signUp = function () {
        var newUser = {
            email: $scope.email,
            name: $scope.name,
            password: $scope.password
        }

        var message = {
            id : 'register',
            newUser : newUser
        };
        sendMessage(message);

    }

    function sendMessage(message) {
        var jsonMessage = JSON.stringify(message);
        console.log('Senging message: ' + jsonMessage);
        ws.send(jsonMessage);
    }

    ws.onmessage = function(message) {
        var parsedMessage = JSON.parse(message.data);
        console.info('Received message: ' + message.data);

        switch (parsedMessage.id) {
            case 'registerResponse':
                registerResponse(parsedMessage);
                break;
            default:
                console.error('Unrecognized message', parsedMessage);
        }
    }

    function registerResponse(message) {
        if (message.response == 'accepted') {
            swal("You were successfully registered", 'Click on "OK" and Log in', "success");


        } else {
            var errorMessage = message.message ? message.message
                : 'Unknown reason for register rejection.';
            console.log(errorMessage);
            swal("Oh oh ...", 'Error registering user.', "error")
        }
    }



}