import Promise from '../shim/Promise';
import has from './has';
import request from './request';
import { isAmdRequire } from './load';
/*
 * Strips <?xml ...?> declarations so that external SVG and XML
 * documents can be added to a document without worry. Also, if the string
 * is an HTML document, only the part inside the body tag is returned.
 */
function strip(text) {
    if (!text) {
        return '';
    }
    text = text.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, '');
    let matches = text.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
    text = matches ? matches[1] : text;
    return text;
}
/*
 * Host-specific method to retrieve text
 */
let getText;
if (has('host-browser')) {
    getText = function (url, callback) {
        request(url).then((response) => {
            response.text().then((data) => {
                callback(data);
            });
        });
    };
}
else if (has('host-node')) {
    let fs = isAmdRequire(require) && require.nodeRequire ? require.nodeRequire('fs') : require('fs');
    getText = function (url, callback) {
        fs.readFile(url, { encoding: 'utf8' }, function (error, data) {
            if (error) {
                throw error;
            }
            callback(data);
        });
    };
}
else {
    getText = function () {
        throw new Error('dojo/text not supported on this platform');
    };
}
/*
 * Cache of previously-loaded text resources
 */
let textCache = {};
/*
 * Cache of pending text resources
 */
let pending = {};
export function get(url) {
    let promise = new Promise(function (resolve, reject) {
        getText(url, function (text) {
            resolve(text);
        });
    });
    return promise;
}
export function normalize(id, toAbsMid) {
    let parts = id.split('!');
    let url = parts[0];
    return (/^\./.test(url) ? toAbsMid(url) : url) + (parts[1] ? '!' + parts[1] : '');
}
export function load(id, require, load, config) {
    let parts = id.split('!');
    let stripFlag = parts.length > 1;
    let mid = parts[0];
    let url = require.toUrl(mid);
    let text;
    function finish(text) {
        load(stripFlag ? strip(text) : text);
    }
    if (mid in textCache) {
        text = textCache[mid];
    }
    else if (url in textCache) {
        text = textCache[url];
    }
    if (!text) {
        if (pending[url]) {
            pending[url].push(finish);
        }
        else {
            let pendingList = (pending[url] = [finish]);
            getText(url, function (value) {
                textCache[mid] = textCache[url] = value;
                for (let i = 0; i < pendingList.length;) {
                    pendingList[i++](value || '');
                }
                delete pending[url];
            });
        }
    }
    else {
        finish(text);
    }
}
//# sourceMappingURL=text.mjs.map