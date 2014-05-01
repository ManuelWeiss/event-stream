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
    'physicsjs/bodies/circle'
], function( Physics ){

});
