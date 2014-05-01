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
    'physicsjs/bodies/circle',
    'physicsjs/bodies/convex-polygon',
    'physicsjs/behaviors/attractor',
    'physicsjs/behaviors/edge-collision-detection',
    'physicsjs/behaviors/newtonian',
    'physicsjs/behaviors/sweep-prune',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/body-impulse-response'
], function(Physics){
    Physics(function(world){
        var viewWidth = window.innerWidth
            ,viewHeight = window.innerHeight
            // center of the window
            ,center = Physics.vector(viewWidth, viewHeight).mult(0.5)
            // bounds of the window
            ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
            ,attractor
            ,edgeBounce
            ,renderer
            ;

        // create a renderer
        renderer = Physics.renderer('canvas', {
            el: 'viewport'
            ,width: viewWidth
            ,height: viewHeight
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
        });

        // attract bodies to a point
        attractor = Physics.behavior('attractor', {
            pos: center
            ,strength: .1
            ,order: 1
        });

        // constrain objects to these bounds
        edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds
            ,restitution: 0.2
            ,cof: 0.8
        });

        // resize events
        window.addEventListener('resize', function () {

            viewWidth = window.innerWidth;
            viewHeight = window.innerHeight;

            renderer.el.width = viewWidth;
            renderer.el.height = viewHeight;

            viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
            // update the boundaries
            edgeBounce.setAABB(viewportBounds);

        }, true);

        var registrationFeed = new EventSource("/chatFeed/registration");
        registrationFeed.addEventListener("message", registrationReceived, false);

        function registrationReceived () {
            createCircle();
        };

        // some fun colors
        var colors = [
            '#b58900',
            '#cb4b16',
            '#dc322f',
            '#d33682',
            '#6c71c4',
            '#268bd2',
            '#2aa198',
            '#859900'
        ];

        function createCircle () {
            var v = Physics.vector(0, 300);
            var b, r;
            var l = Math.floor((Math.random() * colors.length), 0) - 1;

            r = (5 + Math.random()*30)|0;
            b = Physics.body('circle', {
                radius: r
                ,mass: r
                ,x: v.x + center.x
                ,y: v.y + center.y
                ,vx: v.perp().mult(0.0001).x
                ,vx: v.y
                ,styles: {
                    fillStyle: colors[l]
                }
            });

            v.perp(true)
                .mult(10000)
                .rotate(Math.floor((Math.random() * 200), 0) / 3);

            // add things to the world
            world.add(b);

            window.setTimeout(removeCircle, 3000, b);
        }

        function removeCircle (circle) {
            world.remove(circle);
        }

        world.add([
            Physics.behavior('newtonian', {
                strength: 0.005
                ,min: 10
            })
            ,Physics.behavior('body-impulse-response')
            ,edgeBounce
            ,attractor
        ]);

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function( time ) {
            world.step( time );
        });

        // start the ticker
        Physics.util.ticker.start();
    });
});
