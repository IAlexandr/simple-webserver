import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import routers from './lib/server/routers';
import options from './options';

const app = express();
app.use(cors({origin: true}));

app.use(bodyParser.json({limit: '1024mb'}));

routers(app);
const httpServer = http.Server(app);

httpServer.listen(options.PORT);
console.log('Server listen on port:', options.PORT);
