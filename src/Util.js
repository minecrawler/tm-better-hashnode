export default {
    /**
     * Call a REST endpoint with certain parameters
     *
     * @param {string} $endPoint
     * @returns {Promise.<string, {error: Error, response: string, status: number}>}
     */
    callRESTEndpoint($endPoint) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', (
                '/ajax' + ($endPoint.charAt(0) === '/'
                    ? $endPoint
                    : '/' + $endPoint
                )
            ));
            xhr.onerror = err => {
                reject({
                    error: err,
                    response: xhr.response,
                    status: xhr.status,
                });
            };
            xhr.ontimeout = () => {
                reject({
                    error: new Error(`Timeout exceeded`),
                    response: xhr.response,
                    status: xhr.status,
                });
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else if (xhr.status >= 400) {
                    reject({
                        error: new Error(`HTTP Error (${xhr.status})`),
                        response: xhr.response,
                        status: xhr.status,
                    });
                }
            };
            Object
                .keys(httpHeaders)
                .forEach(header => xhr.setRequestHeader(header, httpHeaders[header]))
            ;

            xhr.send(requestBody);
        });
    }
};
