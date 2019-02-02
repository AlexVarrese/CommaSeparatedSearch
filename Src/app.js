var App =  (new function() {

    this.onLoad = function() {
        getElements();
        bindEventHandlers();
        setDefaultViewName();
        enableApp();
        toggleOverlayDisplay();
    };

    var getElements = function() {
        this.viewName = document.getElementById("viewName");
        this.searchBox = document.getElementById("searchBox");
        this.cancelButton = document.getElementById("cancelButton");
        this.saveButton = document.getElementById("saveButton");
        this.overlay = document.getElementById("overlay");
    }.bind(this);

    var bindEventHandlers = function() {
        this.cancelButton.addEventListener("click", cancelSearch);
        this.saveButton.addEventListener("click", saveSearch);
        this.overlay.addEventListener("transitionend", toggleOverlayDisplay);
    }.bind(this);

    var setDefaultViewName = function() {
        this.viewName.value = "Custom search ()";
    }

    var cancelSearch = function() {
        console.log("cancel");
    }.bind(this);

    var saveSearch = function() {
        disableApp();
        window.setTimeout(enableApp, 2000);
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
}());