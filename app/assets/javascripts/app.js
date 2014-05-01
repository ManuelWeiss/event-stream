'use strict';

/** app level module which depends on services and controllers */
angular.module('sseChat', ['sseChat.services', 'sseChat.controllers']);

angular.module('dataVisualization', ['sseChat', 'd3.visualization']);