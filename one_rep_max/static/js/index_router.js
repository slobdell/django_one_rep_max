UploadVideoButtonView = Backbone.View.extend({
    el: "#button-fill-area",
    events: {
        "click #upload-video-button": "clickUploadVideo"
    },
    initialize: function(options){
        this.template = _.template($("#button_area_upload").html());
    },
    clickUploadVideo: function(){
        alert("click upload video clicked");
    },
    render: function(){
        this.$el.html(this.template());
        return this;
    }
});
FacebookButtonView = Backbone.View.extend({
    el: "#button-fill-area",
    events: {
        "click .facebook-button": "clickFacebookConnect"
    },
    initialize: function(options){
        this.router = options.router;
        this.template = _.template($("#button_area_facebook").html())
    },
    getFacebookId: function(){
        FB.api('/v2.1/me', function(response) {
            var facebook_id = response.id;
            return facebook_id;
        });
    },
    clickFacebookConnect: function(){
        var self = this;  // not sure if this is necessary
        var callback = function(response){
            self.router.facebookStatusChangeCallback(response);
        }
        FB.login(callback);
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
    },
    facebookStatusChangeCallback: function(response){
        if (response.status === 'connected') {
            var view = new UploadVideoButtonView({router: this});
            view.render();
        } else if (response.status === 'not_authorized') {
            // logged into Facebook but not app
            var view = new FacebookButtonView({router: this});
            view.render();
        } else {
            // not logged in
            var view = new FacebookButtonView({router: this});
            view.render();
        }
    },
    forceStart: function(){
        /* hacky dev case */
        var view = new UploadVideoButtonView({router: this});
        view.render();
    }
});
