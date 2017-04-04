"use strict";
(function () {
    var attachedVideos = [];
    var peerConnections = {};
    var participants = [];
    var localStream = null;
    var localUserId = "";
    var MediaType = { AUDIO: "audio", VIDEO: "video" };
    var VideoType = { CAMERA: "camera", DESKTOP: "desktop" };
    var options = {
        servers: {
            iceServers: [
                { urls: ["stun:stun.l.google.com:19302"] }
            ]
        },
        offerOptions: {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }
    }

    var connection = $.hubConnection();
    connection.logging = true;
    var hub = connection.createHubProxy('conference');
    hub.on('onUserConnected', function (userId) {
        if (userId != localUserId) {
            createOffer(userId);
        }
    });
    connection.start().done(function () {
        localUserId = generateId();
        invokeHubCall("OnConnected", localUserId);
        createLocalStream(onLocalStreamCreated, onError, false, localUserId);

       
    });

    function invokeHubCall() {
        hub.invoke.apply(hub, arguments);
    }


    function createLocalStream(success, error, isScreenSharing, userId) {
        return navigator.getUserMedia({
            audio: true,
            video: isScreenSharing ? { mediaSource: "window" || "screen" } : { width: 1280, height: 720 }
        }, success.bind(null, userId), error);
    }

    function onLocalStreamCreated(userId, stream) {
        var $streamElement = "<video autoplay='1' data-id='" + userId + "' />";
        $(".videoRecordingWrapper").append($streamElement);
        localStream = stream;
        $('video[data-id="' + userId + '"]')[0].srcObject = stream;
    }

    function onError() {
        
    }

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    function generateId() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }





    function createOffer(userId) {

        var pc = new RTCPeerConnection(options.servers);

        bindPeerConnectionEvents(pc, userId);

        pc.addStream(localStream);

        pc.createOffer(options.offerOptions).then(onCreateOfferSuccess.bind(null, userId));

        peerConnections[userId] = pc;
    }

    function onOfferCreated(description, recipientId) {
        invokeHubCall("SetOffer", description, recipientId);
    }

    function onCreateOfferSuccess(userId, desc) {
        console.log('Offer created');

        peerConnections[userId].setLocalDescription(desc).then(function () {
            console.log('local description is set after offer creation');
        });
        onOfferCreated(new RTCSessionDescription(desc), userId);
        console.log('offer sent');
    }

    function onIceCandidate(userId, event) {
        var ice = event.candidate;
        if (!ice)
            return;

        console.log(ice.candidate);
        onCandidateCreated(ice, userId);
    }

    function bindPeerConnectionEvents(pc, userId) {
        pc.onicecandidate = onIceCandidate.bind(null, userId);
        pc.onaddstream = receiveRemoteStream();
    }

    function onCandidateCreated() {
        
    }

    function attachVideoStream(videoStream, participant) {
        var $streamVideoElement = options.getVideoElementForUser(participant);
        
        $streamVideoElement[0].srcObject = stream;
    }

    function receiveRemoteStream(e) {
        var participant;

        if (participants.length == 1) {
            participant = participants[0];
        }
        else {
            participant = participants.filter(function (participant) {
                return attachedVideos.indexOf(participant) == -1;
            })[0];
        }

        attachedVideos.push(participant);

        attachVideoStream(e.stream, participant);
    }
})();