module.exports = function (RED) {
    var https = require('https');

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
                        done(error + '(' + str + ')');
                    }

                });
            }

            try {

                https
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


    RED.nodes.registerType("weatherflow-stations", WeatherFlowNode);
}