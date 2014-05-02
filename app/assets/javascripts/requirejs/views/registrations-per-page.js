var REGISTRATIONS_PER_PAGE = function (Physics) {
    Physics(function(world){
        var viewWidth = window.innerWidth,
            viewHeight = window.innerHeight,
            // center of the window
            center = Physics.vector(viewWidth, viewHeight - 50).mult(0.5),
            // bounds of the window
            viewportBounds = Physics.aabb(0, 50, viewWidth, viewHeight - 50),
            edgeBounce,
            renderer,
            pages = {};

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

            for (var key in pages) {
                updateCircle(pages[key]);
                growCircle(pages[key]);
            }
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

        function registrationReceived (event) {
            createCircle(JSON.parse(event.data));
        };

        // Circle colours
        var color = { r: 0, g: 177, b: 150 };

        var l = 20;

        function createCircle (event) {
            var b,
                r = 0,
                v = Physics.vector(center.x, center.y),
                page = event.page.path,
                circle;

            if (!pages[page]) {
                b = Physics.body('circle', {
                    radius: r,
                    mass: 20,
                    x: v.x,
                    y: v.y,
                    vx: v.rotate(Math.random() * (360 - 25) + 25).mult(0.0002).x,
                    vy: v.y,
                    restitution: 1,
                    styles: {
                        fillStyle: setColor(color)
                    },
                    options: {
                        color: { r: color.r, g: color.g, b: color.b }
                    }
                });

                v.perp(true)
                    .mult(10000)
                    .rotate(l / 3);

                // add things to the world
                world.add(b);

                pages[page] = b;
            } else {
                circle = pages[page];


                    circle.options.color = { r: color.r, g: color.g, b: color.b };
                    circle.styles.fillStyle = setColor(circle.options.color);

                    circle.view = undefined;

                if (circle.geometry.radius < 150) {
                    circle.geometry.radius += 1;
                    circle.recalc();
                }
            }
        }

        function growCircle (circle) {
            if (circle.geometry.radius < 35) {
                circle.geometry.radius += 1;
                circle.recalc();
            }
        }

        function updateCircle(circle) {
            if (circle.options.color !== 0) {
                circle.options.color = tint(circle.options.color);
                circle.styles.fillStyle = setColor(circle.options.color);

                circle.view = undefined;
            }
        }

        function removeCircle (circle) {
            world.remove(circle);
        }

        function tint (color) {
            for (var key in color) {
                color[key] = color[key] > 15 ? color[key] - 1 : color[key];
            }

            return color;
        }

        function setColor (color) {
            return "rgb(" + color.r + "," + color.g + "," + color.b + ")";
        }

        world.add([
            Physics.behavior('body-impulse-response'),
            Physics.behavior('body-collision-detection'),
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
