"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const environment_1 = require("./src/environment");
const logger_1 = require("./src/logger");
const data_1 = require("./src/routes/data");
const auth_1 = require("./src/routes/auth");
const auth_2 = require("./src/routes/auth");
const auth_3 = require("./src/routes/auth");
const misc_1 = require("./src/routes/misc");
const utils_1 = require("./src/utils");
const requestUtils_1 = require("./src/requestUtils");
const helmet = require('helmet');
const app = express();
app.use(helmet());
app.use(morgan('tiny'));
const server = http.createServer(app);
const port = 3001;
server.listen(port);
app.use(bodyParser.json({ limit: '10mb' }));
if (environment_1.env.trustProxy() === true) {
    app.enable('trust proxy');
}
// CORS: https://enable-cors.org/
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    return next();
});
auth_1.tokenRouter(app);
data_1.dataRouter(app);
auth_2.didRouter(app);
auth_3.signatureRouter(app);
misc_1.misc(app);
if (environment_1.env.pipelineStage() === environment_1.PipelineStages.development) {
    app.post('/debug/set-env/:key/:value', requestUtils_1.adminOnlyHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
        return {
            key: req.params.key,
            value: req.params.value,
        };
    }), ({ key, value }) => __awaiter(this, void 0, void 0, function* () {
        process.env[key] = value;
        return {
            status: 200,
            body: {},
        };
    })));
}
app.get('*', (req, res, next) => res.status(404).end());
app.post('*', (req, res, next) => res.status(404).end());
app.use((err, req, res, next) => {
    const message = err instanceof utils_1.ClientFacingError ? err.message : 'Something went wrong';
    const status = err instanceof utils_1.ClientFacingError ? err.status : 500;
    res.status(status).json({ error: message });
    logger_1.persistError(err.message, err.stack);
});
console.log(`Starting server in ${environment_1.env.pipelineStage()} mode`);
console.log(`Local:  http://localhost:${port}/`);
process.on('unhandledRejection', error => {
    if (error) {
        logger_1.persistError(error.message, error.stack);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNkJBQTRCO0FBQzVCLG1DQUFrQztBQUNsQywwQ0FBeUM7QUFDekMsaUNBQWdDO0FBRWhDLG1EQUFxRDtBQUVyRCx5Q0FBeUM7QUFFekMsNENBQTRDO0FBQzVDLDRDQUEyRDtBQUMzRCw0Q0FBMkM7QUFDM0MsNENBQWlEO0FBRWpELDRDQUFzQztBQUN0Qyx1Q0FBNkM7QUFDN0MscURBQW1EO0FBRW5ELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUVoQyxNQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQTtBQUVyQixHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7QUFDakIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUV2QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3JDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25CLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFFekMsSUFBSSxpQkFBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtJQUM3QixHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0NBQzFCO0FBRUQsaUNBQWlDO0FBQ2pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQ3pCLEdBQUcsQ0FBQyxTQUFTLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFD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