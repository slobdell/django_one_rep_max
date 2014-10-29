function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function dollarCostFromSeconds(numSeconds){
    var cost = 2.0 * numSeconds / 60.0;
    if(cost<0){
        return "0.00";
    }
    var displayCost = "";
    if (cost < 10){
        displayCost = cost.toPrecision(3);
    }
    else {
        displayCost = cost.toPrecision(4);
    }
    return displayCost;
}


ROTATIONS = {
    NONE: 1,
    CLOCKWISE_90: 2,
    CLOCKWISE_180: 3,
    CLOCKWISE_270: 4
};

OrientationView = Backbone.View.extend({
    el: ".modal-content",
    events: {
        "click #orientation-continue": 'clickContinue',
        "click #rotateRight": "rotateRight",
        "click #rotateLeft": "rotateLeft"
    },
    initialize: function(options){
        this.template = _.template($("#orientation_view").html());
        this.thumbnailUrl = window.thumbnailUrl || "https://s3.amazonaws.com/one-rep-max/thumbnails/f4f87eb7-ff12-47bc-a0a1-f7ce5127b204.jpg"; // JUST A TEST FOR NOW
    },
    clickContinue: function(){
        classToRotationValue = {
            'no-rotate': ROTATIONS.NONE,
            'rotate90': ROTATIONS.CLOCKWISE_90,
            'rotate180': ROTATIONS.CLOCKWISE_180,
            'rotate270': ROTATIONS.CLOCKWISE_270
        };
        var rotateEl = this.$("#image-to-rotate");
        for (var className in classToRotationValue){
            if(rotateEl.hasClass(className)){
                window.rotation = classToRotationValue[className];
                break;
            }
        }

        if(window.purchaseFlow){
            Backbone.history.navigate("account/add", {trigger: true});
        }
        else {
            Backbone.history.navigate("summary", {trigger: true});
        }
    },
    _rotate: function(nextClass){
        var rotateEl = this.$("#image-to-rotate");
        var classNames = [
            'no-rotate',
            'rotate90',
            'rotate180',
            'rotate270'
        ];
        for (var index in classNames){
            var className = classNames[index];
            if(rotateEl.hasClass(className)){
                rotateEl.removeClass(className);
                rotateEl.addClass(nextClass[className]);
                break;
            }
        }
    },
    rotateRight: function(){
        var nextClass = {
            'no-rotate': 'rotate90',
            'rotate90': 'rotate180',
            'rotate180': 'rotate270',
            'rotate270': 'no-rotate'
        }
        this._rotate(nextClass);
    },
    rotateLeft: function(){
        var nextClass = {
            'no-rotate': 'rotate270',
            'rotate270': 'rotate180',
            'rotate180': 'rotate90',
            'rotate90': 'no-rotate'
        }
        this._rotate(nextClass);
    },
    render: function(){
        var renderData = {
            thumbnailUrl: this.thumbnailUrl
        };
        this.$el.html(this.template(renderData));
        return this;
    }
});

YouTubeView = Backbone.View.extend({
    el: ".modal-content",
    initialize: function(options){
        this.videoId = options.videoId;
        this.template = _.template($("#youtube_view").html());
    },
    render: function(){
        var renderData = {
            videoId: this.videoId
        }
        this.$el.html(this.template(renderData));
    }
});

ContactView = Backbone.View.extend({
    el: "#button-fill-area",
    events: {
        "click #submit-quandry": "clickSubmit"
    },
    initialize: function(){
        this.template = _.template($("#contact_view").html());
    },
    clickSubmit: function(){
        var returnEmail = this.$("#return-email").val();
        var emailValid = validateEmail(returnEmail);
        if (!emailValid){
            this.$("#email-error").show();
            return;
        }
        var message = this.$("#editable-message").val();
        var self = this;
        this.$("#spinner").show();
        this.$("#submit-quandry").hide();
        $.ajax({
            url: '/api/email/',
            data: {
                returnEmail: returnEmail,
                message: message
            },
            cache: false,
            dataType: 'json',
            traditional: true,
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded;charset=utf-8',
            success: function(response){
                self.$("#spinner").hide();
                self.$("#message-container").html('Contact Form Submitted <i style="color: #0A0;" class="icon-checkmark"></i><br/><br/>');
            },
            error: function(data){
                alert("error");
            }
        });
    },
    render: function(){
        var renderData = {
        }
        this.$el.html(this.template(renderData));
        this.$("#email-error").hide();
        this.$("#spinner").hide();
        var bottomEl = $("#submit-quandry");
        var position = bottomEl.position();
        window.scrollTo(0, position.top);
    }
});

AccountSettingsView = Backbone.View.extend({
    el: ".modal-content",
    events: {
        'click #close-button': 'clickClose',
        'click #add-funds': 'clickAddFunds',
        "hidden.bs.modal #myModal": "clickOutsideModal",
        "click #update-email": "clickSubmit",
        "keypress #settings-email": "pressEmail"
    },
    initialize: function(options){
        this.purchaseFlow = options.purchaseFlow;
        this.initialOverflow = 'visible';
        this.initialPosition = 'static';
        this.template = _.template($("#account_view").html());
        this.hideSubmit = true;

        this.emailValue = '';
        this.credits = "0.00";
        this.error = "";
        this.creditsAdded = false;
        this.videoCost = window.videoCost;

        this.populateUserInfo();
    },
    pressEmail: function(e){
        var oldValue = this.hideSubmit;
        this.hideSubmit = false;
        if (this.hideSubmit != oldValue){
            this.$("#update-email").show();
        }

        if (e.keyCode === 13){
            this.clickSubmit();
        }
    },
    clickSubmit: function(){
        var emailValue = this.$("#settings-email").val();
        this.emailValue = emailValue;
        var emailValid = validateEmail(emailValue);
        if (!emailValid){
            this.error = "Enter a valid email address";
            this.render();
            return;
        }
        var self = this;
        $.ajax({
            url: '/api/user_info/',
            data: {
                emailAddress: this.emailValue
            },
            cache: false,
            dataType: 'json',
            traditional: true,
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded;charset=utf-8',
            success: function(response){
                self.error = 'Email Updated <i style="color: #0A0;" class="icon-checkmark"></i>';
                self.hideSubmit = true;
                self.render();
            },
            error: function(data){
                alert("error");
            }
        });
    },
    populatePage: function(userInfo){
        this.credits = userInfo.credits || 0.0;
        if (this.credits < 10){
            this.credits = this.credits.toPrecision(3);
        }
        else {
            this.credits = this.credits.toPrecision(4);
        }
        if (typeof userInfo.email !== "undefined"){
            var emailValue = userInfo.email;
            var emailValid = validateEmail(emailValue);
            if (emailValid){
                this.emailValue = emailValue;
            }
            this.render();
        }
    },
    clickAddFunds: function(e){
        var self = this;
        var handler = StripeCheckout.configure({
            key: $("#stripe-publish-key").val(),
            image: $("#square-icon").val(),
            email: this.$("#settings-email").val(),
            token: function(token) {
            self.$("#accounts-spinner").show();
            $.ajax({
                url: '/api/add_credits/',
                data: {
                    tokenId: token.id,
                    tokenEmail: token.email
                },
                cache: false,
                dataType: 'json',
                traditional: true,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                success: function(response){
                    var userInfoResponse = response;
                    window.purchaseFlow = false;
                    self.creditsAdded = true;
                    self.populatePage(userInfoResponse);
                    self.$("#accounts-spinner").hide();
                },
                error: function(data){
                    alert("error");
                    self.$("#accounts-spinner").hide();
                }
            });
            }
        });

        handler.open({
            name: 'OneRepMaxCalculator.com',
            description: 'Video Processing Credits ($5.00)',
            amount: 500
        });
        e.preventDefault();
    },
    clickClose: function(){
        this.$("#myModal").modal('hide');
        Backbone.history.navigate("", {trigger: true});
    },
    clickOutsideModal: function(){
        this.clickClose();
    },
    populateUserInfo: function(){
        var self = this;
        $.ajax({
            url: '/api/user_info/?service_id=' + window.facebook_id,
            success: function(response){
                var userInfoResponse = response;
                self.populatePage(userInfoResponse);
            }
        });
    },
    render: function(){
        var renderData = {
            videoCost: this.videoCost,
            purchaseFlow: this.purchaseFlow,
            creditsAdded: this.creditsAdded,
            error: this.error,
            email: this.emailValue,
            credits: this.credits
        }
        this.$el.html(this.template(renderData));
        this.$("#accounts-spinner").hide();
        if (this.hideSubmit){
            this.$("#update-email").hide();
        }

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
        "keyup #stop-time": "updateCost",
        "keyup #start-time": "updateCost",
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
        this.rotation = window.rotation || ROTATIONS.NONE;
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
        timeArray = timeString.split(":");
        var seconds = parseFloat(timeArray[0] * 60);
        if(timeArray.length > 1 && timeArray[1]){
            seconds += parseFloat(timeArray[1]);
        }
        return seconds;
    },
    updateCost: function(){
        var startSeconds = this.convertTimeStringToSeconds(this.$("#start-time").val());
        var endSeconds = this.convertTimeStringToSeconds(this.$("#stop-time").val());
        var deltaSeconds = endSeconds - startSeconds;
        var displayDollars = dollarCostFromSeconds(deltaSeconds);
        this.$("#dollar-cost").html("$" + displayDollars);
    },
    clickSubmit: function(){
        var emailAddress= this.$("#email-input").val();
        var startSeconds = this.convertTimeStringToSeconds(this.$("#start-time").val());
        var endSeconds = this.convertTimeStringToSeconds(this.$("#stop-time").val());
        var videoId = this.videoId;
        var rotation = window.rotation || ROTATIONS.NONE;
        this.$("#spinner").show();
        this.$("#finish-order").hide();

        $.ajax({
            url: '/api/submit_order/',
            data: {
                emailAddress: emailAddress,
                startSeconds: startSeconds,
                endSeconds: endSeconds,
                orientation: rotation,
                videoId: videoId
            },
            cache: false,
            dataType: 'json',
            traditional: true,
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded;charset=utf-8',
            success: function(response){
                self.$("#spinner").hide();
                self.$("#finish-order").show();
                Backbone.history.navigate('thankyou', {trigger: true});
            },
            error: function(data){
                self.$("#spinner").hide();
                self.$("#finish-order").show();
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

        classToRotationValue = {
            'no-rotate': ROTATIONS.NONE,
            'rotate90': ROTATIONS.CLOCKWISE_90,
            'rotate180': ROTATIONS.CLOCKWISE_180,
            'rotate270': ROTATIONS.CLOCKWISE_270
        };
        for (var className in classToRotationValue){
            if(classToRotationValue[className] === this.rotation){
                this.$("#final-thumbnail").addClass(className);
            }
        }

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
        Backbone.history.navigate("", {trigger: true});
    },
    finishPostSuccess: function(videoMeta){
        this.$("#uploading-text").hide();
        // FIXME is this bad?
        window.videoId = videoMeta.id;
        window.videoSeconds = videoMeta.video_seconds;
        window.thumbnailUrl = videoMeta.thumbnail_url;
        window.dollarCost = videoMeta.dollar_cost;

        this.goToNextView(window.dollarCost);
    },
    goToNextView: function(videoCost){
        /* determine if we need to add money or if we can go to order summary */
        var self = this;
        $.ajax({
            url: '/api/user_info/?service_id=' + window.facebook_id,
            success: function(response){
                self.$("#spinner").hide();
                self.$("#upload-video-button-final").show();

                var userInfoResponse = response;
                var credits = userInfoResponse.credits;
                credits = credits || 0; // dev test case
                if (credits < videoCost){
                    window.purchaseFlow = true;
                    window.videoCost = videoCost;
                }
                Backbone.history.navigate("orientation", {trigger: true});
            }
        });
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
            timeout: 60000, // sets timeout to 60 seconds
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
        "orientation": "orientationView",
        "account/add": "accountView",
        "youtube/:videoId": "youtube",
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
        this.youtubeView = null;
        this.orientationView = null;
        this.uploadModalView = new UploadModalView();
        this.uploadVideoButtonView = new UploadVideoButtonView({router: this});
        this.facebookButtonView = new FacebookButtonView({router: this});
        this.contactView = new ContactView();
    },
    orientationView: function(){
        var dependentView = this.uploadModalView;
        dependentView.render();
        this.orientationView = new OrientationView();
        this.orientationView.render();
    },
    contactView: function(){
        this.contactView.render();
    },
    youtube: function(videoId){
        var dependentView = this.uploadModalView;
        dependentView.render();
        this.youtubeView = new YouTubeView({videoId: videoId});
        this.youtubeView.render();
    },
    accountView: function(){
        var url = Backbone.history.fragment;
        var purchaseFlow = true;
        if (url.indexOf("add") === -1){
            purchaseFlow = false;
        }
        var dependentView = this.uploadModalView;
        dependentView.render();
        this.accountSettingsView = new AccountSettingsView({purchaseFlow: purchaseFlow});
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
    updateProfilePicture: function(){
        FB.api('/v2.1/me/picture?redirect=false', function(response){
            var profilePictureUrl = response.data.url;
            $('.profile-circular').css({'background-image':'url(' + profilePictureUrl +')'});
        });
    },
    facebookGetMe: function(){
        var self = this;
        FB.api('/v2.1/me?fields=id,email', function(response) {
            var facebook_id = response.id;
            var facebookEmail = response.email;
            window.facebook_id = facebook_id;
            $.ajax({
                url: '/api/login/',
                data: {
                    facebook_email: facebookEmail,
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
    },
    facebookStatusChangeCallback: function(response){
        if (response.status === 'connected') {
            this.facebookGetMe();
            this.updateProfilePicture();
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

/*
destroyView: function() {

    // COMPLETELY UNBIND THE VIEW
    this.undelegateEvents();
    this.$el.removeData().unbind();

    // Remove view from DOM
    this.remove();
    Backbone.View.prototype.remove.call(this);
}
*/
