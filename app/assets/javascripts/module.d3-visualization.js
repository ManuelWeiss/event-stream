angular.module('dataVisualization', ['d3', 'sseChat'])
    .directive('d3Bulletchart', ['$window', '$timeout', 'd3Service',
        function($window, $timeout, d3Service) {
            return {
                restrict: 'A',
                scope: {
                    label: '@',
                    onClick: '&'
                },
                link: function(scope, ele, attrs) {
                    d3Service.d3().then(function(d3) {
                        var margin = {top: 5, right: 40, bottom: 20, left: 120},
                            width = 960 - margin.left - margin.right,
                            height = 80 - margin.top - margin.bottom;

                        var chart = d3.bullet()
                            .width(width)
                            .height(height);

                        /*
                        scope.data = [
                            {
                                "title":"Registrations",
                                "subtitle":"Number",
                                "ranges":[150,225,300],
                                "measures":[220,270],
                                "markers":[250]
                            }
                        ];
                         */

                        scope.data = angular.element(document.getElementById('main')).scope().msgs;



                        scope.$watch(function() {
                            return angular.element(document.getElementById('main'))[0].offsetWidth;
                        }, function() {
                            scope.render(scope.data);
                        });

                        scope.$watch('data', function(newData) {
                            scope.render(newData);
                        }, true);

                        scope.render = function(eventData) {


                            var countData = eventData.length;

                            data = [
                                {
                                    "title":"Registrations",
                                    "subtitle":"Number",
                                    "ranges":[150,225,300],
                                    "measures":[countData,280],
                                    "markers":[250]
                                }
                            ];


                            var svg = d3.select(ele[0]).selectAll("svg")
                                .data(data)
                                .enter().append("svg")
                                .attr("class", "bullet")
                                .attr("width", width + margin.left + margin.right)
                                .attr("height", height + margin.top + margin.bottom)
                                .append("g")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                .call(chart);

                            var title = svg.append("g")
                                .style("text-anchor", "end")
                                .attr("transform", "translate(-6," + height / 2 + ")");

                            title.append("text")
                                .attr("class", "title")
                                .text(function(d) { return d.title; });

                            title.append("text")
                                .attr("class", "subtitle")
                                .attr("dy", "1em")
                                .text(function(d) { return d.subtitle; });

                        };


                    });
                }
            }
        }])
    .directive('d3Pie', ['$window', '$timeout', 'd3Service',
        function($window, $timeout, d3Service) {
            return {
                restrict: 'A',
                scope: {
                    label: '@',
                    onClick: '&'
                },
                link: function(scope, ele, attrs) {
                    d3Service.d3().then(function(d3) {

                        // Chart design based on the recommendations of Stephen Few. Implementation
                        // based on the work of Clint Ivy, Jamie Love, and Jason Davies.
                        // http://projects.instantcognition.com/protovis/bulletchart/
                        d3.bullet = function() {
                            var orient = "left", // TODO top & bottom
                                reverse = false,
                                duration = 0,
                                ranges = bulletRanges,
                                markers = bulletMarkers,
                                measures = bulletMeasures,
                                width = 380,
                                height = 30,
                                tickFormat = null;

                            // For each small multiple…
                            function bullet(g) {
                                g.each(function(d, i) {
                                    var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
                                        markerz = markers.call(this, d, i).slice().sort(d3.descending),
                                        measurez = measures.call(this, d, i).slice().sort(d3.descending),
                                        g = d3.select(this);

                                    // Compute the new x-scale.
                                    var x1 = d3.scale.linear()
                                        .domain([0, Math.max(rangez[0], markerz[0], measurez[0])])
                                        .range(reverse ? [width, 0] : [0, width]);

                                    // Retrieve the old x-scale, if this is an update.
                                    var x0 = this.__chart__ || d3.scale.linear()
                                        .domain([0, Infinity])
                                        .range(x1.range());

                                    // Stash the new scale.
                                    this.__chart__ = x1;

                                    // Derive width-scales from the x-scales.
                                    var w0 = bulletWidth(x0),
                                        w1 = bulletWidth(x1);

                                    // Update the range rects.
                                    var range = g.selectAll("rect.range")
                                        .data(rangez);

                                    range.enter().append("rect")
                                        .attr("class", function(d, i) { return "range s" + i; })
                                        .attr("width", w0)
                                        .attr("height", height)
                                        .attr("x", reverse ? x0 : 0)
                                        .transition()
                                        .duration(duration)
                                        .attr("width", w1)
                                        .attr("x", reverse ? x1 : 0);

                                    range.transition()
                                        .duration(duration)
                                        .attr("x", reverse ? x1 : 0)
                                        .attr("width", w1)
                                        .attr("height", height);

                                    // Update the measure rects.
                                    var measure = g.selectAll("rect.measure")
                                        .data(measurez);

                                    measure.enter().append("rect")
                                        .attr("class", function(d, i) { return "measure s" + i; })
                                        .attr("width", w0)
                                        .attr("height", height / 3)
                                        .attr("x", reverse ? x0 : 0)
                                        .attr("y", height / 3)
                                        .transition()
                                        .duration(duration)
                                        .attr("width", w1)
                                        .attr("x", reverse ? x1 : 0);

                                    measure.transition()
                                        .duration(duration)
                                        .attr("width", w1)
                                        .attr("height", height / 3)
                                        .attr("x", reverse ? x1 : 0)
                                        .attr("y", height / 3);

                                    // Update the marker lines.
                                    var marker = g.selectAll("line.marker")
                                        .data(markerz);

                                    marker.enter().append("line")
                                        .attr("class", "marker")
                                        .attr("x1", x0)
                                        .attr("x2", x0)
                                        .attr("y1", height / 6)
                                        .attr("y2", height * 5 / 6)
                                        .transition()
                                        .duration(duration)
                                        .attr("x1", x1)
                                        .attr("x2", x1);

                                    marker.transition()
                                        .duration(duration)
                                        .attr("x1", x1)
                                        .attr("x2", x1)
                                        .attr("y1", height / 6)
                                        .attr("y2", height * 5 / 6);

                                    // Compute the tick format.
                                    var format = tickFormat || x1.tickFormat(8);

                                    // Update the tick groups.
                                    var tick = g.selectAll("g.tick")
                                        .data(x1.ticks(8), function(d) {
                                            return this.textContent || format(d);
                                        });

                                    // Initialize the ticks with the old scale, x0.
                                    var tickEnter = tick.enter().append("g")
                                        .attr("class", "tick")
                                        .attr("transform", bulletTranslate(x0))
                                        .style("opacity", 1e-6);

                                    tickEnter.append("line")
                                        .attr("y1", height)
                                        .attr("y2", height * 7 / 6);

                                    tickEnter.append("text")
                                        .attr("text-anchor", "middle")
                                        .attr("dy", "1em")
                                        .attr("y", height * 7 / 6)
                                        .text(format);

                                    // Transition the entering ticks to the new scale, x1.
                                    tickEnter.transition()
                                        .duration(duration)
                                        .attr("transform", bulletTranslate(x1))
                                        .style("opacity", 1);

                                    // Transition the updating ticks to the new scale, x1.
                                    var tickUpdate = tick.transition()
                                        .duration(duration)
                                        .attr("transform", bulletTranslate(x1))
                                        .style("opacity", 1);

                                    tickUpdate.select("line")
                                        .attr("y1", height)
                                        .attr("y2", height * 7 / 6);

                                    tickUpdate.select("text")
                                        .attr("y", height * 7 / 6);

                                    // Transition the exiting ticks to the new scale, x1.
                                    tick.exit().transition()
                                        .duration(duration)
                                        .attr("transform", bulletTranslate(x1))
                                        .style("opacity", 1e-6)
                                        .remove();
                                });
                                d3.timer.flush();
                            }

                            // left, right, top, bottom
                            bullet.orient = function(x) {
                                if (!arguments.length) return orient;
                                orient = x;
                                reverse = orient == "right" || orient == "bottom";
                                return bullet;
                            };

                            // ranges (bad, satisfactory, good)
                            bullet.ranges = function(x) {
                                if (!arguments.length) return ranges;
                                ranges = x;
                                return bullet;
                            };

                            // markers (previous, goal)
                            bullet.markers = function(x) {
                                if (!arguments.length) return markers;
                                markers = x;
                                return bullet;
                            };

                            // measures (actual, forecast)
                            bullet.measures = function(x) {
                                if (!arguments.length) return measures;
                                measures = x;
                                return bullet;
                            };

                            bullet.width = function(x) {
                                if (!arguments.length) return width;
                                width = x;
                                return bullet;
                            };

                            bullet.height = function(x) {
                                if (!arguments.length) return height;
                                height = x;
                                return bullet;
                            };

                            bullet.tickFormat = function(x) {
                                if (!arguments.length) return tickFormat;
                                tickFormat = x;
                                return bullet;
                            };

                            bullet.duration = function(x) {
                                if (!arguments.length) return duration;
                                duration = x;
                                return bullet;
                            };

                            return bullet;
                        };

                        function bulletRanges(d) {
                            return d.ranges;
                        }

                        function bulletMarkers(d) {
                            return d.markers;
                        }

                        function bulletMeasures(d) {
                            return d.measures;
                        }

                        function bulletTranslate(x) {
                            return function(d) {
                                return "translate(" + x(d) + ",0)";
                            };
                        }

                        function bulletWidth(x) {
                            var x0 = x(0);
                            return function(d) {
                                return Math.abs(x(d) - x0);
                            };
                        }

                        var svg = d3.select(ele[0])
                            .append("svg")
                            .append("g")

                        svg.append("g")
                            .attr("class", "slices");
                        svg.append("g")
                            .attr("class", "labels");
                        svg.append("g")
                            .attr("class", "lines");

                        var color = d3.scale.ordinal()
                            .range(["#00b196", "#c9cc38", "#32baec", "#aa519a", "#4058a4", "#797e89", "#3a3f56"]);

                        $window.onresize = function() {
                            scope.$apply();
                        };

                        scope.data = angular.element(document.getElementById('main')).scope().msgs;

                        scope.$watch(function() {
                            return angular.element(document.getElementById('main'))[0].offsetWidth;
                        }, function() {
                            scope.render(scope.data);
                        });

                        scope.$watch('data', function(newData) {
                            if (newData && newData[0] && newData[0].page && newData[0].page.category) {
                                scope.render(newData);
                            }

                        }, true);

                        scope.render = function(eventData) {
                            var countData = _.countBy(eventData, function(_event){
                                return _event.page.category;
                            });

                            var width = document.getElementById('main').getBoundingClientRect().width;
                            var height = 300;

                            var radius = Math.min(width, height) / 2;

                            var pie = d3.layout.pie()
                                .sort(null)
                                .value(function(d) {
                                    return d.value;
                                });

                            var arc = d3.svg.arc()
                                .outerRadius(radius * 0.8)
                                .innerRadius(radius * 0.4);

                            var outerArc = d3.svg.arc()
                                .innerRadius(radius * 0.9)
                                .outerRadius(radius * 0.9);

                            svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                            var key = function(d){ return d.data.label; };



                            var data = [];
                            for (var k in countData) {
                                if (countData.hasOwnProperty(k)) {
                                    data.push({
                                        label: k,
                                        value: countData[k]
                                    });
                                }
                            }

                            /* ------- PIE SLICES ------- */
                            var slice = svg.select(".slices").selectAll("path.slice")
                                .data(pie(data), key);

                            slice.enter()
                                .insert("path")
                                .style("fill", function(d) { return color(d.data.label); })
                                .attr("class", "slice");

                            slice
                                .transition().duration(1000)
                                .attrTween("d", function(d) {
                                    this._current = this._current || d;
                                    var interpolate = d3.interpolate(this._current, d);
                                    this._current = interpolate(0);
                                    return function(t) {
                                        return arc(interpolate(t));
                                    };
                                })

                            slice.exit()
                                .remove();

                            // ------- TEXT LABELS -------

                            var text = svg.select(".labels").selectAll("text")
                                .data(pie(data), key);

                            text.enter()
                                .append("text")
                                .attr("dy", ".35em")
                                .text(function(d) {
                                    return d.data.label;
                                });

                            function midAngle(d){
                                return d.startAngle + (d.endAngle - d.startAngle)/2;
                            }

                            text.transition().duration(1000)
                                .attrTween("transform", function(d) {
                                    this._current = this._current || d;
                                    var interpolate = d3.interpolate(this._current, d);
                                    this._current = interpolate(0);
                                    return function(t) {
                                        var d2 = interpolate(t);
                                        var pos = outerArc.centroid(d2);
                                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                                        return "translate("+ pos +")";
                                    };
                                })
                                .styleTween("text-anchor", function(d){
                                    this._current = this._current || d;
                                    var interpolate = d3.interpolate(this._current, d);
                                    this._current = interpolate(0);
                                    return function(t) {
                                        var d2 = interpolate(t);
                                        return midAngle(d2) < Math.PI ? "start":"end";
                                    };
                                });

                            text.exit()
                                .remove();

                            // ------- SLICE TO TEXT POLYLINES -------

                            var polyline = svg.select(".lines").selectAll("polyline")
                                .data(pie(data), key);

                            polyline.enter()
                                .append("polyline");

                            polyline.transition().duration(1000)
                                .attrTween("points", function(d){
                                    this._current = this._current || d;
                                    var interpolate = d3.interpolate(this._current, d);
                                    this._current = interpolate(0);
                                    return function(t) {
                                        var d2 = interpolate(t);
                                        var pos = outerArc.centroid(d2);
                                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                                    };
                                });

                            polyline.exit()
                                .remove();

                        };
                    });
                }
            }
        }]);






