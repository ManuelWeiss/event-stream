require.config({
    baseUrl: '/assets/javascripts/requirejs/',
    packages: [
        {
          name: 'physicsjs',
          location: 'physicsjs',
          main: 'physicsjs-0.6.0.min'
        }
    ]
});

require([
    'physicsjs',
    'physicsjs/renderers/canvas',
    'physicsjs/bodies/rectangle',
    'physicsjs/behaviors/attractor',
    'physicsjs/behaviors/edge-collision-detection',
    'physicsjs/behaviors/newtonian',
    'physicsjs/behaviors/sweep-prune',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/body-impulse-response',
    'views/pageviews'
], function (Physics) {
    PAGEVIEWS(Physics);
});
