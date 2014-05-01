'use strict';

/** chatModel service, provides chat Streams (could as well be loaded from server) */
angular.module('sseChat.services', []).service('chatModel', function () {
    var getStreams = function () {
        return [
            {name: 'Streams 1', value: 'stream1'},
            {name: 'Streams 2', value: 'stream2'},
            {name: 'Streams 3', value: 'stream3'},
            {name: 'Streams 4', value: 'stream4'},
            {name: 'Streams 5', value: 'stream5'}
        ];
    };
    return { getStreams: getStreams };
});