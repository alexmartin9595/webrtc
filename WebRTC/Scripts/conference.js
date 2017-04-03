"use strict";
(function () {

    var connection = $.hubConnection();
    connection.logging = true;
    var hub = connection.createHubProxy('conference');
    connection.start().done(function () {
        hub.invoke.apply(hub, ["Hello"]);
    });
})();