const { stat } = require('fs');

module.exports = function (RED) {
    var http = require('http');

    function WeatherFlowNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.client = RED.nodes.getNode(config.client);
        node.device = config.device;
        node.deviceType = config.deviceType;
        node.dayOffset = config.dayOffset;
        node.timeStart = config.timeStart;
        node.timeEnd = config.timeEnd;


        node.on('input', function (msg, send, done) {
            var deviceId = RED.util.evaluateNodeProperty(node.device, node.deviceType, node, msg);

            var query = '?token=' + node.client.token;

            if (node.dayOffset) query += "&day_offset=" + node.dayOffset;
            if (node.timeStart) query += "&time_start=" + node.timeStart;
            if (node.timeEnd) query += "&time_end=" + node.timeEnd;
            node.debug(query);
            
            var options = {
                host: 'swd.weatherflow.com',
                path: '/swd/rest/observations/device/' + deviceId + query
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


    RED.nodes.registerType("observations-device", WeatherFlowNode);
}