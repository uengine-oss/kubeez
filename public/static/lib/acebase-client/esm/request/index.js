import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';
import { AceBaseRequestError } from './error.js';
/**
 * @returns returns a promise that resolves with an object containing data and an optionally returned context
 */
export default function request(method, url, options = { accessToken: null, data: null, dataReceivedCallback: null, dataRequestCallback: null, context: null }) {
    return new Promise(async (resolve, reject) => {
        const endpoint = new URL(url); // URL.parse(url);
        let postData = options.data;
        if (typeof postData === 'undefined' || postData === null) {
            postData = '';
        }
        else if (typeof postData === 'object') {
            postData = JSON.stringify(postData);
        }
        const request = {
            method: method,
            protocol: endpoint.protocol,
            host: endpoint.hostname,
            port: endpoint.port,
            path: endpoint.pathname + endpoint.search,
            headers: {
                'AceBase-Context': JSON.stringify(options.context || null),
            },
            body: undefined,
        };
        if (method !== 'GET') {
            if (typeof options.dataRequestCallback !== 'function') {
                request.headers['Content-Type'] = 'application/json';
                request.headers['Content-Length'] = Buffer.byteLength(postData);
            }
        }
        if (options.accessToken) {
            request.headers['Authorization'] = `Bearer ${options.accessToken}`;
        }
        const client = { request: request.protocol === 'https:' ? httpsRequest : httpRequest };
        const req = client.request(request, res => {
            res.setEncoding('utf8');
            let data = '';
            if (typeof options.dataReceivedCallback === 'function') {
                res.on('data', options.dataReceivedCallback);
            }
            else {
                res.on('data', chunk => { data += chunk; });
            }
            res.on('end', () => {
                const isJSON = data[0] === '{' || data[0] === '['; // || (res.headers['content-type'] || '').startsWith('application/json')
                if (res.statusCode === 200) {
                    const contextHeader = res.headers['acebase-context']; // lowercase header names only
                    let context;
                    if (contextHeader && contextHeader[0] === '{') {
                        context = JSON.parse(contextHeader);
                    }
                    else {
                        context = {};
                    }
                    if (isJSON) {
                        data = JSON.parse(data);
                    }
                    resolve({ context, data });
                }
                else {
                    request.body = postData;
                    const response = {
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        headers: res.headers,
                        body: data,
                    };
                    let code = res.statusCode, message = res.statusMessage;
                    if (isJSON) {
                        const err = JSON.parse(data);
                        if (err.code) {
                            code = err.code;
                        }
                        if (err.message) {
                            message = err.message;
                        }
                    }
                    return reject(new AceBaseRequestError(request, response, code, message));
                }
            });
        });
        req.on('error', (err) => {
            reject(new AceBaseRequestError(request, null, err.code || err.name, err.message));
        });
        if (typeof options.dataRequestCallback === 'function') {
            // Stream data to the server instead of posting all from memory at once
            const chunkSize = req.writableHighWaterMark || 1024 * 16;
            let chunk;
            while (![null, ''].includes(chunk = await options.dataRequestCallback(chunkSize))) {
                const ok = req.write(chunk);
                if (!ok) {
                    await new Promise(resolve => req.once('drain', resolve));
                }
            }
        }
        else if (postData.length > 0) {
            req.write(postData);
        }
        req.end();
    });
}
//# sourceMappingURL=index.js.map