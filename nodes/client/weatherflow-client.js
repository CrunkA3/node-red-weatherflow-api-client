module.exports = function (RED) {
    function WeatherFlowClientNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.token = this.credentials.token;
    }

    RED.nodes.registerType("weatherflow-client", WeatherFlowClientNode, {
        credentials: {
            token: { type: "text" }
        }
    });
}