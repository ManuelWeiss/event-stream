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
    'physicsjs/renderers/canvas',
    'physicsjs/bodies/circle',
    'physicsjs/bodies/convex-polygon',
    'physicsjs/behaviors/newtonian',
    'physicsjs/behaviors/sweep-prune',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/body-impulse-response'
], function(require, Physics){

});
