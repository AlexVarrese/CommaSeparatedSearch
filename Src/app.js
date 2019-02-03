var App =  (new function() {

    this.onLoad = function() {
        getElements();
        bindEventHandlers();
        setDefaultViewName();
        this.searchBox.focus();
        if(typeof(GetGlobalContext) === "undefined") {
            this.whenReady = new Promise();
        } else {
            this.whenReady = CrmSdk.retrieveVersion()
                .then(getViewRequirements);
        }
    };

    var getElements = function() {
        this.viewName = document.getElementById("viewName");
        this.searchBox = document.getElementById("searchBox");
        this.cancelButton = document.getElementById("cancelButton");
        this.saveButton = document.getElementById("saveButton");
        this.overlay = document.getElementById("overlay");
        this.error = document.getElementById("error");
        this.success = document.getElementById("success");
        this.spinner = document.getElementById("spinner");
    }.bind(this);

    var bindEventHandlers = function() {
        this.saveButton.addEventListener("click", saveSearch);
        this.overlay.addEventListener("transitionend", toggleOverlayDisplay);
    }.bind(this);

    var setDefaultViewName = function() {
        this.viewName.value = "Custom Search Created on " + formatDate(new Date());
    }

    var formatDate = function(date) {
        if(typeof(GetGlobalContext) === "undefined") {
            return date.toLocaleString();
        } else {
            return date.format(GetGlobalContext().userSettings.dateFormattingInfo.FullDateTimePattern);
        }
    }

    var saveSearch = function() {
        this.viewName.value = this.viewName.value.trim();
        disableApp();
        this.whenReady
        .then(function(options) {
            var primaryNameAttribute = options.primaryNameAttribute;

            var fetchXmlDoc = new DOMParser().parseFromString(options.fetchXml, "text/xml");
            var parentFilter = fetchXmlDoc.getElementsByTagName("filter")[0];
            var searchFilter = fetchXmlDoc.createElement("filter");
            searchFilter.setAttribute("type", "or");
            var searchQuery = this.searchBox.value.split(",");
            for(var i = 0; i < searchQuery.length; i++) {
                var search = "%" + searchQuery[i].trim() + "%";
                var condition = fetchXmlDoc.createElement("condition");
                condition.setAttribute("attribute", primaryNameAttribute);
                condition.setAttribute("operator", "like");
                condition.setAttribute("value", search);
                searchFilter.append(condition);
            }
            parentFilter.append(searchFilter);
            var fetchXml = fetchXmlDoc.firstElementChild.outerHTML;

            var newView = options.newView;
            newView.name = this.viewName.value;
            newView.fetchxml = fetchXml;

            return CrmSdk.request("POST", "/userqueries", newView);
        }).then(function() {
            showSuccess();
        }).catch(function(error) {
            showError(error.message);
            enableApp();
        });
    }.bind(this);

    var showError = function(error) {
        this.error.style.display = "block";
        this.error.innerText = "Error saving view. Please check your criteria and try again. " + error;
    }.bind(this);

    var showSuccess = function() {
        this.spinner.addEventListener("transitionend", function() {
            this.spinner.style.display = "none";
            this.success.style.display = "flex";
            this.success.style.opacity = 1;
        }.bind(this));
        this.spinner.style.opacity = 0;
    }.bind(this);

    var enableApp = function() {
        setAppAvailability(true);
    }.bind(this);

    var disableApp = function() {
        setAppAvailability(false);
    }.bind(this);

    var setAppAvailability = function(isEnabled) {
        var disabledValue = isEnabled ? undefined : "";
        this.viewName.disabled = disabledValue;
        this.searchBox.disabled = disabledValue;
        this.saveButton.disabled = disabledValue;
        this.cancelButton.disabled = disabledValue;

        this.overlay.style.zIndex = 1;
        this.overlay.className = isEnabled ? "hidden" : undefined;
    }.bind(this);

    var toggleOverlayDisplay = function() {
        var isHidden = this.overlay.className == "hidden";
        if(isHidden) {
            this.overlay.style.zIndex = -1;
        }
    }.bind(this);

    function getViewRequirements() {
        var entityName = getParameterByName("Data");
        return Promise.all([getPrimaryNameAttribute(entityName), getDefaultView(entityName)])
        .then(function(results) {
            var primaryNameAttribute = results[0];
            var defaultView = results[1];
            return {
                primaryNameAttribute: primaryNameAttribute,
                fetchXml: defaultView.fetchxml,
                newView: {
                    returnedtypecode: entityName,
                    layoutxml: defaultView.layoutxml,
                    querytype: 0
                }
            };
        });
    }

    function getPrimaryNameAttribute(entityName) {
        return CrmSdk.request("GET", "/EntityDefinitions(LogicalName='" + entityName + "')?$select=PrimaryNameAttribute")
        .then(function(request) {
            var response = JSON.parse(request.response);
            var primaryNameAttribute = response.PrimaryNameAttribute;
            return primaryNameAttribute;
        });
    }

    function getDefaultView(entityName) {
        return CrmSdk.request("GET",
            "/savedqueries?" +
                "$select=" +
                    "layoutxml," +
                    "fetchxml" +
                "&$filter=" +
                        "returnedtypecode eq '" + entityName + "'" +
                    " and isdefault eq true" +
                    " and querytype eq 0")
        .then(function(request) {
            var response = JSON.parse(request.response);
            var view = response.value[0];
            return view;
        });
    }

    function getParameterByName(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
}());