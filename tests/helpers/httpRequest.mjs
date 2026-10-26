import { IncomingMessage, ServerResponse } from 'node:http';
import { Duplex } from 'node:stream';

// Exercise Express's actual middleware/router without opening a TCP port.
export function httpRequest(app, path, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const timeout = setTimeout(() => reject(new Error(`HTTP test timed out: ${method} ${path}`)), 5000);
    const socket = new Duplex({
      read() {},
      write(chunk, _encoding, callback) { chunks.push(Buffer.from(chunk)); callback(); },
    });
    const req = new IncomingMessage(socket);
    const payload = body === undefined ? '' : JSON.stringify(body);
    req.method = method;
    req.url = path;
    req.headers = Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
    if (body !== undefined) {
      req.headers['content-type'] = 'application/json';
      req.headers['content-length'] = String(Buffer.byteLength(payload));
    }
    const res = new ServerResponse(req);
    res.assignSocket(socket);
    const fail = error => { clearTimeout(timeout); reject(error); };
    res.once('error', fail);
    socket.once('error', fail);
    res.once('finish', () => {
      clearTimeout(timeout);
      const raw = Buffer.concat(chunks).toString();
      const text = raw.slice(raw.indexOf('\r\n\r\n') + 4);
      resolve({ status: res.statusCode, text, json: () => JSON.parse(text) });
      socket.destroy();
    });
    app(req, res);
    if (payload) req.push(payload);
    req.complete = true;
    req.push(null);
  });
}
