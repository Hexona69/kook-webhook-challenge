import bodyParser from 'body-parser';
import express from 'express';
import upath from 'upath';
import test from './api/test.route';

function relativePath(...path: string[]) {
    return upath.join(__dirname, ...path);
}

const http = express();
let port = 8888;


http.use(bodyParser.json());
http.use('/static', express.static(relativePath('static')));
http.get('*', (req, res) => {
    res.sendFile(relativePath('index.htm'), { maxAge: 1 });
})
http.use('/test', test);


import('get-port').then(({ default: getPort }) => {
    getPort({ port }).then(function (port) {
        http.listen(port, () => {
            console.log(`Kasumi starts listening on port ${port}\nhttp://localhost:${port}`);
        });
    })
})