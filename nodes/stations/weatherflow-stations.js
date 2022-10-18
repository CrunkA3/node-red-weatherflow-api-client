module.exports = function (RED) {
    var http = require('http');

    function WeatherFlowNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.client = RED.nodes.getNode(config.client);

        node.on('input', function (msg, send, done) {
            var options = {
                host: 'swd.weatherflow.com',
                path: '/swd/rest/stations?token=' + node.client.token
            };

            callback = function (response) {
                var str = '';

                //another chunk of data has been received, so append it to `str`
                response.on('data', function (chunk) {
                    str += chunk;
                });

                //the whole response has been received, so we just print it out here
                response.on('end', function () {
                    console.log(str);
                });
            }

            http.request(options, callback).end();

            // If an error is hit, report it to the runtime
            if (err) {
                if (done) {
                    // Node-RED 1.0 compatible
                    done(err);
                } else {
                    // Node-RED 0.x compatible
                    node.error(err, msg);
                }
            }
        });
    }


    RED.nodes.registerType("weatherflow-stations", WeatherFlowNode);
}