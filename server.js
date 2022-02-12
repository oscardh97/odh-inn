const http = require("http");
const expressApp = require("./index.js");

const port = 8080;
const server = http.createServer(expressApp);

console.log(`Server liseting in port: ${port}`)
server.listen(port);
