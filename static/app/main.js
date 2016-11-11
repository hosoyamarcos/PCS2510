var kurentoApp = angular.module('kurentoApp',[])
	.controller('kurentoAppCtrl', function ($scope) {
		var ws = new WebSocket('wss://' + location.host + '/one2one');
		var videoInput;
		var videoOutput;
		var webRtcPeer;
		videoInput = document.getElementById('videoInput');
		videoOutput = document.getElementById('videoOutput');
		$scope.allUsersList = [];

		var registerName = null;
		const NOT_REGISTERED = 0;
		const REGISTERING = 1;
		const REGISTERED = 2;
		var registerState = null

		function setRegisterState(nextState) {
			switch (nextState) {
				case NOT_REGISTERED:
					$('#register').attr('disabled', false);
					$('#call').attr('disabled', true);
					$('#terminate').attr('disabled', true);
					break;

				case REGISTERING:
					$('#register').attr('disabled', true);
					break;

				case REGISTERED:
					$('#register').attr('disabled', true);
					setCallState(NO_CALL);
					break;

				default:
					return;
			}
			registerState = nextState;
		}

		const NO_CALL = 0;
		const PROCESSING_CALL = 1;
		const IN_CALL = 2;
		var callState = null

		function setCallState(nextState) {
			switch (nextState) {
				case NO_CALL:
					$('#call').attr('disabled', false);
					$('#terminate').attr('disabled', true);
					break;

				case PROCESSING_CALL:
					$('#call').attr('disabled', true);
					$('#terminate').attr('disabled', true);
					break;
				case IN_CALL:
					$('#call').attr('disabled', true);
					$('#terminate').attr('disabled', false);
					break;
				default:
					return;
			}
			callState = nextState;
		}

		// window.onload = function() {
		// 	console = new Console();
		// 	setRegisterState(NOT_REGISTERED);
		// 	var drag = new Draggabilly(document.getElementById('videoSmall'));
		// 	videoInput = document.getElementById('videoInput');
		// 	videoOutput = document.getElementById('videoOutput');
		// 	document.getElementById('name').focus();
        //
		// 	document.getElementById('register').addEventListener('click', function() {
		// 		register();
		// 	});
		// 	document.getElementById('call').addEventListener('click', function() {
		// 		call();
		// 	});
		// 	document.getElementById('terminate').addEventListener('click', function() {
		// 		stop();
		// 	});
		// }

		window.onbeforeunload = function() {
			ws.close();
		}

		ws.onmessage = function(message) {
			var parsedMessage = JSON.parse(message.data);
			console.info('Received message: ' + message.data);

			switch (parsedMessage.id) {
				case 'registerResponse':
					resgisterResponse(parsedMessage);
					break;
				case 'callResponse':
					callResponse(parsedMessage);
					break;
				case 'incomingCall':
					incomingCall(parsedMessage);
					break;
				case 'startCommunication':
					startCommunication(parsedMessage);
					break;
				case 'stopCommunication':
					console.info("Communication ended by remote peer");
					$scope.stop(true);
					break;
				case 'iceCandidate':
					webRtcPeer.addIceCandidate(parsedMessage.candidate)
					break;
				default:
					console.error('Unrecognized message', parsedMessage);
			}
		}

		function resgisterResponse(message) {
			if (message.response == 'accepted') {
				setRegisterState(REGISTERED);

			} else {
				setRegisterState(NOT_REGISTERED);
				var errorMessage = message.message ? message.message
					: 'Unknown reason for register rejection.';
				console.log(errorMessage);
				swal("Oh oh ...", 'Error registering user.', "error")
				return;
				alert('Error registering user. See console for further information.');
			}
		}

		function callResponse(message) {
			if (message.response != 'accepted') {
				console.info('Call not accepted by peer. Closing call');
				var errorMessage = message.message ? message.message
					: 'Unknown reason for call rejection.';
				console.log(errorMessage);
				stop(true);
			} else {
				setCallState(IN_CALL);
				webRtcPeer.processAnswer(message.sdpAnswer);
			}
		}

		function startCommunication(message) {
			setCallState(IN_CALL);
			webRtcPeer.processAnswer(message.sdpAnswer);
		}

		function incomingCall(message) {
			// If bussy just reject without disturbing user
			if (callState != NO_CALL) {
				var response = {
					id : 'incomingCallResponse',
					from : message.from,
					callResponse : 'reject',
					message : 'bussy'

				};
				return sendMessage(response);
			}

			setCallState(PROCESSING_CALL);
			var userCalling = 'User'  + message.from + ' is calling you';

			swal({
					title: "Do you accept the call?",
					text: userCalling,
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Yes, accept!",
					cancelButtonText: "No, cancel",
					closeOnConfirm: true,
					closeOnCancel: true
				},
				function(isConfirm){
					if (isConfirm) {
						var options = {
							localVideo : videoInput,
							remoteVideo : videoOutput,
							onicecandidate : onIceCandidate
						}

						webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
							function(error) {
								if (error) {
									console.error(error);
									setCallState(NO_CALL);
								}

								this.generateOffer(function(error, offerSdp) {
									if (error) {
										console.error(error);
										setCallState(NO_CALL);
									}
									var response = {
										id : 'incomingCallResponse',
										from : message.from,
										callResponse : 'accept',
										sdpOffer : offerSdp
									};
									sendMessage(response);
								});
							});

					} else {
						var response = {
							id : 'incomingCallResponse',
							from : message.from,
							callResponse : 'reject',
							message : 'user declined'
						};
						sendMessage(response);
						stop(true);
					}
				});

			// if (confirm('User ' + message.from
			// 		+ ' is calling you. Do you accept the call?')) {
			// 	//showSpinner(videoInput, videoOutput);
            //
			// 	var options = {
			// 		localVideo : videoInput,
			// 		remoteVideo : videoOutput,
			// 		onicecandidate : onIceCandidate
			// 	}
            //
			// 	webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
			// 		function(error) {
			// 			if (error) {
			// 				console.error(error);
			// 				setCallState(NO_CALL);
			// 			}
            //
			// 			this.generateOffer(function(error, offerSdp) {
			// 				if (error) {
			// 					console.error(error);
			// 					setCallState(NO_CALL);
			// 				}
			// 				var response = {
			// 					id : 'incomingCallResponse',
			// 					from : message.from,
			// 					callResponse : 'accept',
			// 					sdpOffer : offerSdp
			// 				};
			// 				sendMessage(response);
			// 			});
			// 		});
            //
			// } else {
			// 	var response = {
			// 		id : 'incomingCallResponse',
			// 		from : message.from,
			// 		callResponse : 'reject',
			// 		message : 'user declined'
			// 	};
			// 	sendMessage(response);
			// 	stop(true);
			// }
		}

		$scope.register = function () {
			var name = $scope.name;
			if (name == '') {
				swal("Oh oh ...", "You must insert you user name", "error")
				return;
			}

			setRegisterState(REGISTERING);

			var message = {
				id : 'register',
				name : name
			};
			sendMessage(message);
			// $scope.peer;
		}

		$scope.call = function () {
			if (!$scope.peer) {
				swal("Oh oh ...", "You must insert the peer name", "error")
				return;
			}

			setCallState(PROCESSING_CALL);

			//showSpinner(videoInput, videoOutput);
			console.log(videoInput)

			var options = {
				localVideo : videoInput,
				remoteVideo : videoOutput,
				onicecandidate : onIceCandidate
			}

			webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(error) {
				if (error) {
					console.error(error);
					setCallState(NO_CALL);
				}

				this.generateOffer(function(error, offerSdp) {
					if (error) {
						console.error(error);
						setCallState(NO_CALL);
					}
					var message = {
						id : 'call',
						from : $scope.name,
						to : $scope.peer,
						sdpOffer : offerSdp
					};
					sendMessage(message);
				});
			});

		}

		$scope.stop = function (message) {
			setCallState(NO_CALL);
			if (webRtcPeer) {
				webRtcPeer.dispose();
				webRtcPeer = null;

				if (!message) {
					var message = {
						id : 'stop'
					}
					sendMessage(message);
				}
			}
			//hideSpinner(videoInput, videoOutput);
		}

		function sendMessage(message) {
			var jsonMessage = JSON.stringify(message);
			console.log('Senging message: ' + jsonMessage);
			ws.send(jsonMessage);
		}

		function onIceCandidate(candidate) {
			console.log('Local candidate' + JSON.stringify(candidate));

			var message = {
				id : 'onIceCandidate',
				candidate : candidate
			}
			sendMessage(message);
		}

		function showSpinner() {
			for (var i = 0; i < arguments.length; i++) {
				arguments[i].poster = './img/transparent-1px.png';
				arguments[i].style.background = 'center transparent url("./img/spinner.gif") no-repeat';
			}
		}

		function hideSpinner() {
			for (var i = 0; i < arguments.length; i++) {
				arguments[i].src = '';
				arguments[i].poster = './img/webrtc.png';
				arguments[i].style.background = '';
			}
		}

		/**
		 * Lightbox utility (to display media pipeline image in a modal dialog)
		 */
		$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
			event.preventDefault();;
			$(this).ekkoLightbox();
		});


	});






