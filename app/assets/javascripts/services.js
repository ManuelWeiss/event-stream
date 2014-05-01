'use strict';

/** chatModel service, provides chat Streams (could as well be loaded from server) */
angular.module('sseChat.services', []).service('chatModel', function () {
    var getStreams = function () {
        return [
            {name: 'Registration',  value: 'registration'},
            {name: 'Login',         value: 'login'},
            {name: 'Site Created',  value: 'site-created'},
            {name: 'Subscription',  value: 'subscription'},
            {name: 'Cancellation',  value: 'cancellation'},
            {name: 'Page View',     value: 'page-view'}
        ];
    };
    return { getStreams: getStreams };
});
