
ClickMeView = Backbone.View.extend({
    el: "#button-fill-area",
    events: {
        "click .facebook-button": "clickFacebookConnect"
    },
    initialize: function(options){
        this.template = _.template($("#button_area_facebook").html())
        this.initFacebook();
    },
    initFacebook: function(){
    },
    getFacebookId: function(){
        FB.api('/v2.1/me', function(response) {
            var facebook_id = response.id;
            return facebook_id;
        });
    },
    clickFacebookConnect: function(){
    },
    clickUploadVideo: function(){
    },
    render: function(){
        this.$el.html(this.template());
        return this;
    }
});


IndexRouter = Backbone.Router.extend({
    routes: {
        "*anyPath": "defaultRoute"
    },
    /*
    routes: {
        "help":                 "help",    // #help
        "search/:query":        "search",  // #search/kiwis
        "search/:query/p:page": "search"   // #search/kiwis/p7
    },
    */
    initialize: function(options){
    },
    defaultRoute: function(path){
        var view = new ClickMeView();
        view.render();
    },
    facebookStatusChangeCallback: function(response){
        if (response.status === 'connected') {
            alert("logged in");
        } else if (response.status === 'not_authorized') {
            alert("logged into facebook but not app");
        } else {
            alert("not logged in");
        }
    }
});
