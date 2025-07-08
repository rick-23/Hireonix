const http = require('http');
const app = require('./app');

const port = process.env.PORT || '8000';
app.set('port', port);

const server = http.createServer(app);

function onError(error) {
    if (error.syscall !== 'listen') throw error;
    switch (error.code) {
        case 'EACCES':
        case 'EADDRINUSE':
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    console.info(`Server is listening on ${bind}`);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);