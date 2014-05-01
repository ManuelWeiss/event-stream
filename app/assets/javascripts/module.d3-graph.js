angular.module('d3.graph', ['d3', 'sseChat'])
    .directive('d3Graph', ['$window', '$timeout', 'd3Service',
        function($window, $timeout, d3Service) {
            return {
                restrict: 'A',
                scope: {
                    label: '@',
                    onClick: '&'
                },
                link: function(scope, ele, attrs) {
                    d3Service.d3().then(function(d3) {
                        var svg = d3.select(ele[0])
                            .append("svg")
                            .append("g")

                        svg.append("g")
                            .attr("class", "slices");
                        svg.append("g")
                            .attr("class", "labels");
                        svg.append("g")
                            .attr("class", "lines");

                        var width = 960,
                            height = 450,
                            radius = Math.min(width, height) / 2;

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

                        var color = d3.scale.ordinal()
                            .range(["#00b196", "#c9cc38", "#32baec", "#aa519a", "#4058a4", "#797e89", "#3a3f56"]);

                        $window.onresize = function() {
                            scope.$apply();
                        };

                        scope.data = angular.element(document.getElementById('header')).scope().msgs;

                        scope.$watch(function() {
                            return angular.element($window)[0].innerWidth;
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