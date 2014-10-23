function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/*
destroy_view: function() {

// COMPLETELY UNBIND THE VIEW
//     this.undelegateEvents();
//
//         this.$el.removeData().unbind();
//
//             // Remove view from DOM
//                 this.remove();
//                     Backbone.View.prototype.remove.call(this);
//
//                     }
*/
ContactView = Backbone.View.extend({
    el: "#button-fill-area",
    initialize: function(){
        this.template = _.template($("#contact_view").html());
    },
    render: function(){
        var renderData = {
        }
        this.$el.html(this.template(renderData));
        var bottomEl = $("#submit-quandry");
        var position = bottomEl.position();
        window.scrollTo(0, position.top);
    }
});

AccountSettingsView = Backbone.View.extend({
    el: ".modal-content",
    events: {
        'click #close-button': 'clickClose',
        "hidden.bs.modal #myModal": "clickOutsideModal"
    },
    initialize: function(){
        this.initialOverflow = 'visible';
        this.initialPosition = 'static';
        this.template = _.template($("#account_view").html());

        this.emailValue = '';
        this.credits = 0.0

        this.populateUserInfo();
    },
    clickClose: function(){
        this.$("#myModal").modal('hide');
        Backbone.history.navigate("", {trigger: true});
        $('body').css('overflow', this.initialOverflow);
        $('body').css('position', this.initialPosition);
    },
    clickOutsideModal: function(){
        this.clickClose();
    },
    populateUserInfo: function(){
        var self = this;
        $.ajax({
            url: '/api/user_info/?service_id=' + window.facebook_id,
            success: function(response){
                if (typeof response.email !== "undefined"){
                    var emailValue = response.email;
                    var emailValid = validateEmail(emailValue);
                    if (emailValid){
                        self.emailValue = emailValue;
                    }
                    self.render();
                }
            }
        });
    },
    render: function(){
        var renderData = {
            email: this.emailValue,
            credits: this.credits
        }
        this.$el.html(this.template(renderData));

        return this;
    }
});

ThankYouView = Backbone.View.extend({
    el: ".modal-content",
    events: {
        'click #close-button': 'clickClose'
    },
    initialize: function(){
        this.initialOverflow = 'visible';
        this.initialPosition = 'static';
        this.template = _.template($("#thankyou_view").html());
    },
    clickClose: function(){
        this.$("#myModal").modal('hide');
        $('body').css('overflow', this.initialOverflow);
        $('body').css('position', this.initialPosition);
        Backbone.history.navigate("", {trigger: true});
    },
    render: function(){
        var renderData = {
        }
        this.$el.html(this.template(renderData));

        return this;
    }
});

OrderSummaryView = Backbone.View.extend({
    el: ".modal-content",
    events: {
        "keyup #email-input": "changeEmailInput",
        "change #email-input": "changeEmailInput",
        "paste #email-input": "changeEmailInput",
        "click #finish-order": "clickSubmit"
    },
    /*
     * this should have start and stop point
     *                  total cost
     *                  image thumbnail
     */
    initialize: function(options){
        this.template = _.template($("#order_summary_view").html());
        var videoSeconds = window.videoSeconds || 0;
        this.videoMinutes = parseInt(videoSeconds / 60);
        this.videoMinutes = this.videoMinutes.toString();
        this.videoSeconds = window.videoSeconds % 60 || 0;
        this.videoSeconds = this.videoSeconds.toPrecision(4);
        this.videoId = window.videoId;
        var tempString = this.videoSeconds.toString();
        if (this.videoSeconds < 10){
            tempString = "0" + tempString;
        }
        this.videoSeconds = tempString;
        this.thumbnailUrl = window.thumbnailUrl || "";
        this.dollarCost = window.dollarCost || "0.00";
        this.hideSubmit = true;
        this.emailValue = "";
        this.pollValidEmail();
        this.getSavedEmail();
    },
    getSavedEmail: function(){
        var self = this;
        $.ajax({
            url: '/api/user_info/?service_id=' + window.facebook_id,
            success: function(response){
                if (typeof response.email !== "undefined"){
                    self.emailValue = response.email;
                    var emailValid = validateEmail(self.emailValue);
                    if (emailValid){
                        self.hideSubmit = false;
                        self.render();
                    }
                }
            }
        });
    },
    pollValidEmail: function(){
        var emailValue = this.$("#email-input").val();
        var emailValid = validateEmail(emailValue);
        var self = this;
        if (emailValid){
            this.hideSubmit = false;
            this.$("#finish-order").show();
        }
        setTimeout(function(){
            self.pollValidEmail();
        }, 1000);
    },
    convertTimeStringToSeconds: function(timeString){
        time_array = timeString.split(":");
        var seconds = time_array[0] * 60 + time_array[1];
        return seconds;
    },
    clickSubmit: function(){
        var emailAddress= this.$("#email-input").val();
        var startSeconds = this.convertTimeStringToSeconds(this.$("#start-time").val());
        var endSeconds = this.convertTimeStringToSeconds(this.$("#stop-time").val());
        var videoId = this.videoId;

        $.ajax({
            url: '/api/submit_order/',
            data: {
                emailAddress: emailAddress,
                startSeconds: startSeconds,
                endSeconds: endSeconds,
                videoId: videoId
            },
            cache: false,
            dataType: 'json',
            traditional: true,
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded;charset=utf-8',
            success: function(response){
                Backbone.history.navigate('thankyou', {trigger: true});
            },
            error: function(data){
                alert("error");
            }
        });
    },
    changeEmailInput: function(e){
        var emailValue = this.$("#email-input").val();
        this.emailValue = emailValue;
        var emailValid = validateEmail(emailValue);
        if (emailValid){
            this.hideSubmit = false;
            this.$("#finish-order").show();
        }
        if (e.keyCode === 13 && emailValid){
            this.clickSubmit();
        }
    },
    render: function(){
        var renderData = {
            videoMinutes: this.videoMinutes,
            videoSeconds: this.videoSeconds,
            thumbnailUrl: this.thumbnailUrl,
            emailValue: this.emailValue,
            dollarCost: this.dollarCost
        }
        this.$el.empty().append(this.template(renderData));
        var self = this;
        setTimeout(function(){
            self.$("#email-input").focus();
        }, 500);
        this.$("#spinner").hide();
        // only show if email address is valid
        if(this.hideSubmit){
            this.$("#finish-order").hide();
        }
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
        this.errorMessage = "";
    },
    closeModal: function(){
        this.$("#myModal").modal('hide');
        $('body').css('overflow', this.initialOverflow);
        $('body').css('position', this.initialPosition);
        Backbone.history.navigate("", {trigger: true});
    },
    finishPostSuccess: function(videoMeta){
        this.$("#uploading-text").hide();
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
        this.$("#uploading-text").hide();
        this.$("#spinner").hide();
        this.$("#upload-video-button-final").show();
        this.errorMessage = "There was an error uploading your file.  If the problem persists, <a href='#contact'>contact us</a>.";
        this.render();
    },
    postData: function(){
        this.$("#spinner").show();
        this.$("#upload-video-button-final").hide();
        this.$("#uploading-text").show();
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
        if (!(typeof file === "undefined")){
            this.videoName = file.name;
            this.formData = new FormData();
            this.formData.append('file', file);
            this.videoUploaded = true;
        }
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
            errorMessage: this.errorMessage,
            videoUploaded: this.videoUploaded
        }
        this.$el.html(this.template(renderData));
        this.$("#spinner").hide();
        this.$("#uploading-text").hide();
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
        var self = this;
        var callback = function(response){
            self.router.facebookStatusChangeCallback(response);
        }
        FB.login(callback);
    },
    render: function(){
        $("#account-link").hide();
        this.$el.html(this.template());
        return this;
    }
});


IndexRouter = Backbone.Router.extend({
    routes: {
        "account": "accountView",
        "thankyou": "thankYouView",
        "summary": "orderSummaryView",
        "contact": "contactView",
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
        this.devMode = options.devMode;
        this.loggedIn = false;

        this.orderSummaryView = null;
        this.thankYouView = null;
        this.accountSettingsView = null;
        this.uploadModalView = new UploadModalView();
        this.uploadVideoButtonView = new UploadVideoButtonView({router: this});
        this.facebookButtonView = new FacebookButtonView({router: this});
        this.contactView = new ContactView();
    },
    contactView: function(){
        this.contactView.render();
    },
    accountView: function(){
        var dependentView = this.uploadModalView;
        dependentView.render();
        this.accountSettingsView = new AccountSettingsView();
        this.accountSettingsView.render();
    },
    thankYouView: function(){
        var dependentView = this.uploadModalView;
        dependentView.render();
        this.thankYouView = new ThankYouView();
        this.thankYouView.render();
    },
    orderSummaryView: function(){
        var dependentView = this.uploadModalView;
        dependentView.render();
        this.orderSummaryView = new OrderSummaryView();
        this.orderSummaryView.render();
    },
    uploadView: function(){
        this.uploadModalView.render();
    },
    defaultRoute: function(path){
        if (this.loggedIn){
            this.uploadVideoButtonView.render();
        }
        else {
            this.facebookButtonView.render();
        }
        if (this.devMode){
            this.forceStart();
        }
    },
    facebookStatusChangeCallback: function(response){
        if (response.status === 'connected') {
            var self = this;
            FB.api('/v2.1/me', function(response) {
                var facebook_id = response.id;
                window.facebook_id = facebook_id;
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
                        $("#account-link").show();
                        var currentRoute = self.routes[Backbone.history.fragment];
                        if (currentRoute === "defaultRoute"){
                            self.uploadVideoButtonView.render();
                        }
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
        // this.defaultRoute();
    },
    forceStart: function(){
        /* hacky dev case */
        // TODO make this unavailable in prod
        var self = this;
        var facebook_id = 1000000;
        $("#account-link").show();
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
                self.uploadVideoButtonView.render();
            },
            error: function(data){
                alert("error");
            }
        });
    }
});
