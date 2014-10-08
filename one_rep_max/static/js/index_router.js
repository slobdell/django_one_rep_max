UploadModalView = Backbone.View.extend({
    el: "#button-fill-area",
    events: {
        "click #cancel-button": "clickCancelButton"
    },
    initialize: function(options){
        this.template = _.template($("#upload_modal_view").html());
    },
    clickCancelButton: function(){
        this.$("#myModal").modal('hide');
        Backbone.history.navigate("", {trigger: true});
    },
    render: function(){
        this.$el.html(this.template());
        this.$("#myModal").modal();
        return this;
    }
});

UploadVideoButtonView = Backbone.View.extend({
    el: "#button-fill-area",
    events: {
        "click #upload-video-button": "clickUploadVideo"
    },
    initialize: function(options){
        this.router = options.router;
        this.template = _.template($("#button_area_upload").html());
    },
    clickUploadVideo: function(){
        Backbone.history.navigate('upload', {trigger: true});
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
        "upload": "uploadView",
        "": "defaultRoute"
    },
    /*
    routes: {
        "help":                 "help",    // #help
        "search/:query":        "search",  // #search/kiwis
        "search/:query/p:page": "search"   // #search/kiwis/p7
    },
    */
    initialize: function(options){
        this.loggedIn = false;
    },
    uploadView: function(){
        var view = new UploadModalView();
        view.render();
    },
    defaultRoute: function(path){
        if (this.loggedIn){
            var view = new UploadVideoButtonView({router: this});
            view.render();
        }
        else {
            var view = new FacebookButtonView({router: this});
            view.render();
        }
    },
    facebookStatusChangeCallback: function(response){
        if (response.status === 'connected') {
            this.loggedIn = true;
        } else if (response.status === 'not_authorized') {
            this.loggedIn = false;
            // logged into Facebook but not app
        } else {
            this.loggedIn = false;
            // not logged in
        }
        this.defaultRoute();
    },
    forceStart: function(){
        this.loggedIn = true;
        /* hacky dev case */
        var view = new UploadVideoButtonView({router: this});
        view.render();
    }
});
