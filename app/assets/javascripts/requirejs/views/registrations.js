var REGISTRATIONS = function (Physics) {
    Physics(function(world){
        var viewWidth = window.innerWidth,
            viewHeight = window.innerHeight,
            // center of the window
            center = Physics.vector(viewWidth, viewHeight).mult(0.5),
            // bounds of the window
            viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight),
            edgeBounce,
            renderer;

        // create a renderer
        renderer = Physics.renderer('canvas', {
            el: 'viewport',
            width: viewWidth,
            height: viewHeight
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
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

        // Circle colours
        var colors = [
            '#520E24',
            '#8F2041',
            '#DC554F',
            '#FF905E',
            '#FFDB77'
        ];

        var l = 20;

        function createCircle () {
            var b, r;
            var v = Physics.vector(center.x, center.y);

            r = 15;

            b = Physics.body('circle', {
                radius: r,
                mass: r,
                x: v.x,
                y: v.y,
                vx: v.rotate(Math.random() * (360 - 25) + 25).mult(0.0001).x,
                vy: v.y,
                styles: {
                    fillStyle: colors[colors.length - 1]
                },
                options: {
                    color: colors.length - 1
                }
            });

            v.perp(true)
                .mult(10000)
                .rotate(l / 3);

            // add things to the world
            world.add(b);

            window.setTimeout(updateCircle, 3000, b);
        }

        function updateCircle(circle) {
            if (circle.options.color === 1) {
                removeCircle(circle);
            } else {
                circle.options.color -= 1;
                circle.styles.fillStyle = colors[circle.options.color];

                circle.view = undefined;

                window.setTimeout(updateCircle, 3000, circle);
            }
        }

        function removeCircle (circle) {
            world.remove(circle);
        }

        world.add([
            Physics.behavior('body-impulse-response'),
            Physics.behavior('sweep-prune'),
            edgeBounce
        ]);

        // Subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function(time) {
            world.step(time);
        });

        // Start the ticker
        Physics.util.ticker.start();
    });
};
