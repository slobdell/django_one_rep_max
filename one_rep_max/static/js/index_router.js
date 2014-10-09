UploadModalView = Backbone.View.extend({
    el: "#button-fill-area",
    events: {
        "click #cancel-button": "clickCancelButton",
        "click .close": "clickClose",
        "click #choose-file": "clickChooseFile",
        "change #upfile": "uploadFileChanged",
        "click #upload-video-button-final": "postData"
    },
    initialize: function(options){
        this.videoUploaded = false;
        this.template = _.template($("#upload_modal_view").html());
        this.videoName = "";
        this.formData = new FormData();
        this.initialOverflow = 'visible';
        this.initialPosition = 'static';
    },
    closeModal: function(){
        this.$("#myModal").modal('hide');
         $('body').css('overflow', this.initialOverflow);
         $('body').css('position', this.initialPosition);
        Backbone.history.navigate("", {trigger: true});
    },
    postData: function(){
        $.ajax({
            url: 'rest/accounts/upload/',
            data: this.formData,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data){
                alert("success");
            },
            error: function(data){
                alert("fail");
            }
        });
    },
    uploadFileChanged: function(){
        var file = this.$('input[name="upfile"]')[0].files[0];
        this.videoName = file.name;
        this.formData = new FormData();
        this.formData.append('file', file);
        this.videoUploaded = true;
        this.render();
    },
    clickCancelButton: function(){
        this.closeModal();
    },
    clickClose: function(){
        this.closeModal();
    },
    clickChooseFile: function(){
        this.$("#upfile").click();
    },
    render: function(){
        var renderData = {
            videoName: this.videoName,
            videoUploaded: this.videoUploaded
        }
        this.$el.html(this.template(renderData));
        this.$("#myModal").modal();
        $('body').css('overflow','hidden');
        $('body').css('position','fixed');
        if (!this.videoUploaded){
            this.$("#upload-video-button-final").hide();
        }
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
