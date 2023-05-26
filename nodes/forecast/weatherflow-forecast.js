const { stat } = require('fs');

module.exports = function (RED) {
    var http = require('http');

    function WeatherFlowNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.client = RED.nodes.getNode(config.client);
        node.station = config.station;
        node.stationType = config.stationType;

        node.units_temp = config.units_temp;
        node.units_wind = config.units_wind;
        node.units_pressure = config.units_pressure;
        node.units_precip = config.units_precip;
        node.units_distance = config.units_distance;

        node.on('input', function (msg, send, done) {
            var input = this;
            var stationId = RED.util.evaluateNodeProperty(node.station, node.stationType, node, msg);

            var query = '?station_id=' + stationId + '&token=' + node.client.token;

            if (node.units_temp) query += '&units_temp=' + node.units_temp;
            if (node.units_wind) query += '&units_wind=' + node.units_wind;
            if (node.units_pressure) query += '&units_pressure=' + node.units_pressure;
            if (node.units_precip) query += '&units_precip=' + node.units_precip;
            if (node.units_distance) query += '&units_distance=' + node.units_distance;

            var options = {
                host: 'swd.weatherflow.com',
                path: '/swd/rest/better_forecast' + query
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


    RED.nodes.registerType("weatherflow-forecast", WeatherFlowNode);
}