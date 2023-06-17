const { stat } = require('fs');

module.exports = function (RED) {
    var http = require('http');

    function WeatherFlowNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.client = RED.nodes.getNode(config.client);
        node.station = config.station;
        node.stationType = config.stationType;


        node.on('input', function (msg, send, done) {
            var stationId = RED.util.evaluateNodeProperty(node.station, node.stationType, node, msg);

            var query = '?token=' + node.client.token;

            var options = {
                host: 'swd.weatherflow.com',
                path: '/swd/rest/observations/station/' + stationId + query
            };

            callback = function (response) {
                var str = '';

                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    try {
                        msg.payload = JSON.parse(str);

                        if (msg.payload.status.status_code == 0) {
                            send(msg);
                            done();
                        }
                        else {
                            done(msg);
                        }
                    } catch (error) {
                        done(error);
                    }
                });
            }

            try {
                http
                    .request(options, callback)
                    .on("error", (e) => {
                        done('problem with request: ${e.message}');
                    })
                    .end();
            } catch (error) {
                done(error);
            }
        });
    }


    RED.nodes.registerType("observations-station", WeatherFlowNode);
}