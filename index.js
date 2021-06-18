require('dotenv').config();
const app = require('./api/app');
const config = require('./common/config');

if(config.devMode){
    console.log('========TEST MODE ACTIVE - WARNING======')
    console.log('----Available routes----');
    config.routes.forEach(route => {
        console.log(`Name: ${route.name} - Route: ${route.route} - Required Token: ${route.needToken}. To Ask methods: ${route.askMethods}`);
    })
    console.log('========================================')
}
app.listen(config.port, function() {
    console.log(`>> BE API for: ${config.project_name}<<<`);
    console.log('Express server running on port: ' + config.port);
});
