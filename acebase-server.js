const { AceBaseServer } = require('acebase-server');
const dbname = 'mydb';
const settings = {
    host: '0.0.0.0',
    port: 5757,
    authentication: {
        enabled: true,
        allowUserSignup: true,
        defaultAccessRule: 'auth',
        defaultAdminPassword: '75sdDSFg37w5'
    }
}
const server = new AceBaseServer(dbname, settings);

server.on("ready", () => {
    console.log("SERVER ready");
});