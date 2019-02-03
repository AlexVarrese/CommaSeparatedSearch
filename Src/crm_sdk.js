window.CrmSdk = window.CrmSdk || {};

CrmSdk.versionManager = new function () {
    var _webApiMajorVersion = 8;
    var _webApiMinorVersion = 0;

    Object.defineProperties(this, {
        "webApiMajorVersion": {
            get: function () {
                return _webApiMajorVersion;
            },
            set: function (value) {
                if (typeof value != "number") {
                    throw new Error("CrmSdk.versionManager.webApiMajorVersion property must be a number.")
                }
                _webApiMajorVersion = parseInt(value, 10);
            }
        },
        "webApiMinorVersion": {
            get: function () {
                return _webApiMinorVersion;
            },
            set: function (value) {
                if (isNaN(value)) {
                    throw new Error("CrmSdk.versionManager.webApiMinorVersion property must be a number.")
                }
                _webApiMinorVersion = parseInt(value, 10);
            }
        },
        "webApiPath": {
            get: function () {
                return "/api/data/v" + _webApiMajorVersion + "." + _webApiMinorVersion;
            }
        }
    });
};

CrmSdk.getClientUrl = function() {
    var context;
    if(typeof(GetGlobalContext) === "undefined") {
        if(typeof(Xrm) === "undefined") {
            throw new Error("Unable to retrieve client url");
        } else {
            context = Xrm.Page.context;
        }
    } else {
        context = GetGlobalContext();
    }
    return context.getClientUrl();
}

CrmSdk.request = (function() {
    return request;

    function request(action, uri, data, addHeader) {
        validateArguments(action, uri, data, addHeader);

        uri = fixUri(uri);

        return new Promise(function (resolve, reject) {
            var request = createRequest(action, uri, addHeader, true);

            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    request.onreadystatechange = null;
                    switch (this.status) {
                        case 200:
                        case 201:
                        case 204:
                            resolve(this);
                            break;
                        default:
                            var error;
                            try {
                                error = JSON.parse(request.response).error;
                            } catch (e) {
                                error = new Error("Unexpected Error");
                            }
                            reject(error);
                            break;
                    }
                }
            };
            request.send(data === undefined ? "" : JSON.stringify(data));
        });
    }

    function validateArguments(action, uri, data, addHeader) {
        if (!RegExp(action, "g").test("POST PATCH PUT GET DELETE")) { // Expected action verbs.
            throw new Error("CrmSdk.request: action parameter must be one of the following: " +
                "POST, PATCH, PUT, GET, or DELETE.");
        }

        if (!typeof uri === "string") {
            throw new Error("CrmSdk.request: uri parameter must be a string.");
        }

        if ((RegExp(action, "g").test("PATCH PUT")) && (!data)) {
            throw new Error("CrmSdk.request: data parameter must not be null for operations that create or modify data.");
        }

        if (addHeader) {
            if (typeof addHeader.header != "string" || typeof addHeader.value != "string") {
                throw new Error("CrmSdk.request: addHeader parameter must have header and value properties that are strings.");
            }
        }
    }

    function fixUri(uri) {
        if (uri.charAt(0) === "/") {
            var newUri = CrmSdk.getClientUrl() + CrmSdk.versionManager.webApiPath + uri;
            return newUri;
        }

        return uri;
    }

    function createRequest(action, uri, addHeader) {
        var request = new XMLHttpRequest();
        request.open(action, encodeURI(uri), true);
        request.setRequestHeader("OData-MaxVersion", "4.0");
        request.setRequestHeader("OData-Version", "4.0");
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        if (addHeader) {
            request.setRequestHeader(addHeader.header, addHeader.value);
        }

        return request;
    }
}());

CrmSdk.retrieveVersion = (function() {
    return retrieveVersion;

    function retrieveVersion() {
        return new Promise(function (resolve, reject) {
            CrmSdk.request("GET", "/RetrieveVersion").then(function (request) {
                try {
                    processResponse(request);
                    resolve();
                } catch (err) {
                    reject(new Error("Error processing version: " + err.message))
                }
            })
            .catch(function (err) {
                reject(new Error("Error retrieving version: " + err.message))
            });
        });
    }

    function processResponse(request) {
        var retrieveVersionResponse = JSON.parse(request.response);
        var fullVersion = retrieveVersionResponse.Version;
        var versionData = fullVersion.split(".");
        CrmSdk.versionManager.webApiMajorVersion = parseInt(versionData[0], 10);
        CrmSdk.versionManager.webApiMinorVersion = parseInt(versionData[1], 10);
    }
}());