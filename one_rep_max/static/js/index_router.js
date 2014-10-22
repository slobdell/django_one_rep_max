OrderSummaryView = Backbone.View.extend({
    el: ".modal-content",
    /*
     * this should have start and stop point
     *                  total cost
     *                  image thumbnail
     */
    initialize: function(options){
        this.template = _.template($("#order_summary_view").html());
        this.videoMinutes = parseInt(window.videoSeconds / 60);
        this.videoMinutes = this.videoMinutes.toString();
        this.videoSeconds = window.videoSeconds % 60 || 0;
        this.videoSeconds = this.videoSeconds.toPrecision(4);
        var tempString = this.videoSeconds.toString();
        if (this.videoSeconds < 10){
            tempString = "0" + tempString;
        }
        this.videoSeconds = tempString;
        this.thumbnailUrl = window.thumbnailUrl || "";
        this.dollarCost = window.dollarCost || "0.00";
    },
    render: function(){
        var renderData = {
            videoMinutes: this.videoMinutes,
            videoSeconds: this.videoSeconds,
            thumbnailUrl: this.thumbnailUrl,
            dollarCost: this.dollarCost
        }
        this.$el.empty().append(this.template(renderData));
        this.$("#spinner").hide();
    }
});

UploadModalView = Backbone.View.extend({
    el: "#button-fill-area",
    events: {
        "click #cancel-button": "clickCancelButton",
        "click .close": "clickClose",
        "click #choose-file": "clickChooseFile",
        "change #upfile": "uploadFileChanged",
        "click #upload-video-button-final": "postData",
        "hidden.bs.modal #myModal": "clickOutsideModal"
    },
    initialize: function(options){
        this.videoUploaded = false;
        this.template = _.template($("#upload_modal_view").html());
        this.videoName = "";
        this.formData = new FormData();
        this.initialOverflow = 'visible';
        this.initialPosition = 'static';
        this.maxTimeBetweenClicks = 3000;
        this.lastClicked =  new Date().getTime() - this.maxTimeBetweenClicks;
        this.clickable = true;
    },
    closeModal: function(){
        this.$("#myModal").modal('hide');
        $('body').css('overflow', this.initialOverflow);
        $('body').css('position', this.initialPosition);
        Backbone.history.navigate("", {trigger: true});
    },
    finishPostSuccess: function(videoMeta){
        // FIXME is this bad?
        window.videoId = videoMeta.id;
        window.videoSeconds = videoMeta.video_seconds;
        window.thumbnailUrl = videoMeta.thumbnail_url;
        window.dollarCost = videoMeta.dollar_cost;

        this.$("#spinner").hide();
        this.$("#upload-video-button-final").show();
        Backbone.history.navigate("summary", {trigger: true});
    },
    finishPostFail: function(){
        this.$("#spinner").hide();
        this.$("#upload-video-button-final").show();
        // SBL TODO display some kind of error message
        alert("fail");
    },
    postData: function(){
        this.$("#spinner").show();
        this.$("#upload-video-button-final").hide();
        var self = this;
        $.ajax({
            url: '/api/upload_video/',
            data: this.formData,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(response){
                self.finishPostSuccess(response);
            },
            error: function(data){
                self.finishPostFail();
            }
        });
    },
    uploadFileChanged: function(){
        // this doesn't seem to work all the time for iPhone, can't pinpoint why...change event isnt firing
        var file = this.$('input[name="upfile"]')[0].files[0];
        this.videoName = file.name;
        this.formData = new FormData();
        this.formData.append('file', file);
        this.videoUploaded = true;
        this.render();
        this.$("#choose-file").show();
        this.clickable = true;
    },
    clickCancelButton: function(){
        this.closeModal();
    },
    clickClose: function(){
        this.closeModal();
    },
    clickChooseFile: function(){
        var currentClickTime = new Date().getTime();
        if (currentClickTime - this.lastClicked < this.maxTimeBetweenClicks){
            return;
        }
        if (!this.clickable){
            return;
        }
        this.clickable = false;
        this.lastClicked = currentClickTime;
        this.$("#upfile").click();
        this.$("#choose-file").hide();
    },
    clickOutsideModal: function(){
        this.closeModal();
    },
    render: function(){
        var renderData = {
            videoName: this.videoName,
            videoUploaded: this.videoUploaded
        }
        this.$el.html(this.template(renderData));
        this.$("#spinner").hide();
        this.$("#myModal").modal();
        $('body').css('overflow','hidden');
        $('body').css('position','fixed');
        if (!this.videoUploaded){
            this.$("#upload-video-button-final").hide();
        }
        this.delegateEvents();

        var self = this;
        $(document).on('focus', '#myModal', function(e) {
            self.$("#choose-file").show();
            self.clickable = true;
        });
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
        "summary": "orderSummaryView",
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
    orderSummaryView: function(){
        var dependentView = new UploadModalView();
        dependentView.render();
        var view = new OrderSummaryView();
        view.render();
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
            var self = this;
            FB.api('/v2.1/me', function(response) {
                var facebook_id = response.id;
                $.ajax({
                    url: '/api/login/',
                    data: {
                        facebook_service_id: facebook_id
                    },
                    cache: false,
                    dataType: 'json',
                    traditional: true,
                    type: 'POST',
                    success: function(data){
                        self.loggedIn = true;
                        var view = new UploadVideoButtonView({router: self});
                        view.render();
                    },
                    error: function(data){
                        alert("error");
                    }
                });
            });
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
        /* hacky dev case */
        // TODO make this unavailable in prod
        var self = this;
        var facebook_id = 1000000;
        $.ajax({
            url: '/api/login/',
            data: {
                facebook_service_id: facebook_id
            },
            cache: false,
            dataType: 'json',
            traditional: true,
            type: 'POST',
            success: function(data){
                self.loggedIn = true;
                var view = new UploadVideoButtonView({router: self});
                view.render();
            },
            error: function(data){
                alert("error");
            }
        });
    }
});
