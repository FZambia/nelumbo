var React = require('react'),
    Router = require('react-router'),
    $ = require('jquery'),
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    Route = Router.Route,
    RouteHandler = Router.RouteHandler,
    NotFoundRoute = Router.NotFoundRoute;

apiURL = window.location.origin + "/api/";
videoMediaPrefix = 'public/videos/';
previewMediaPrefix = 'public/previews/';

var videos = [
    {
        "video": "flowers.mp4",
        "preview": "flowers.jpg",
        "frames": 100,
        "duration": "01:04",
        "size": "15Mb",
        "original": "http://www.youtube.com/watch?v=xW_AsV7k42o"
    },
    {
        "video": "norway.mp4",
        "preview": "norway.jpg",
        "frames": 100,
        "duration": "00:30",
        "size": "5.8Mb",
        "original": "https://vimeo.com/107469289"
    },
    {
        "video": "iceland.mp4",
        "preview": "iceland.jpg",
        "frames": 100,
        "duration": "01:14",
        "size": "18Mb",
        "original": "https://vimeo.com/11673745"
    }
];

var videosByName = {};
for (var i in videos) {
    var video = videos[i];
    videosByName[video.video] = video;
}

var messages = {};

var App = React.createClass({
    mixins: [Router.State],
    getInitialState: function() {
        return {
            "url": window.location.href
        }
    },
    updateUrl: function() {
        this.setState({url: window.location.href});
    },
    resizeVideo: function(){
        var b = $(window).width(), c = $(window).height(), d = b / c, e = 1280, f = 720, g = e / f;
        var videoPlayer = $(".b-video__player");
        if (d > g) {
            videoPlayer.removeClass("b-video__player_vertical");
        } else {
            videoPlayer.addClass("b-video__player_vertical");
        }
    },
    componentDidMount: function() {
        $(window).resize(function(){
           this.resizeVideo();
        }.bind(this));
        this.resizeVideo();
    },
    render: function () {
        return (
            <div className="b-container">
                <Logo />
                <Share url={this.state.url} />
                <RouteHandler app={this} />
            </div>
        );
    }
});

var MainHandler = React.createClass({
    getInitialState: function() {
        return {}
    },
    componentDidMount: function() {
        this.props.app.updateUrl();
    },
    render: function () {
        return (
            <div className="b-page">
                <Header />
                <Form />
            </div>
        )
    }
});


var NotFoundHandler = React.createClass({
    render: function () {
        return (
            <div className="b-not-found">
                404 not found
            </div>
        )
    }
});

var Logo = React.createClass({
    mixins: [Router.Navigation],
    handleClick: function(e) {
        this.transitionTo("main");
    },
    render: function() {
        return (
            <div className="b-logo" onClick={this.handleClick}>
            </div>
        )
    }
});

var Share = React.createClass({
    render: function() {
        var url = encodeURIComponent(this.props.url);
        var text = encodeURIComponent("Share messages with video background ") + url;
        return (
            <ul className="b-share">
	            <li><a href={"https://www.facebook.com/sharer/sharer.php?u=" + url} target="_blank" title="Share on Facebook"><img src="public/images/share/Facebook.png" /></a></li>
	            <li><a href={"https://twitter.com/intent/tweet?text=" + text} target="_blank" title="Tweet"><img src="public/images/share/Twitter.png" /></a></li>
            </ul>
        )
    }
});

var Header = React.createClass({
    render: function() {
        return (
            <div className="b-header">
                <h2>New message</h2>
            </div>
        )
    }
});

var videoIndex = Math.floor(Math.random() * videos.length);

var Form = React.createClass({
    mixins: [Router.Navigation],
    getInitialState: function(){
        return {
            sender: "",
            receiver: "",
            text: "",
            video: videos[videoIndex].video,
            size: videos[videoIndex].size,
            duration: videos[videoIndex].duration,
            isDisabled: false
        }
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var btn = $(this.refs.submit.getDOMNode());
        var data = {
            "sender": this.state.sender,
            "receiver": this.state.receiver,
            "text": this.state.text,
            "video": this.state.video
        };
        this.setState({isDisabled: true});
        $.post(apiURL, data, function(data) {
            messages[data.uid] = data;
            this.transitionTo("message", {messageId: data.uid}, {});
        }.bind(this), "json").error(function(){
            btn.addClass("b-form__submit_error").delay(1000).queue(function(next){
                $(this).removeClass("b-form__submit_error");
                next();
            });
        }.bind(this)).always(function(){
            this.setState({isDisabled: false});
        }.bind(this));
    },
    handleSenderChange: function(e) {
        this.setState({"sender": e.target.value})
    },
    handleReceiverChange: function(e) {
        this.setState({"receiver": e.target.value})
    },
    handleTextChange: function(e) {
        this.setState({"text": e.target.value})
    },
    handlePreviewClick: function(e) {
        var nextIndex;
        if (videoIndex === (videos.length-1)) {
            nextIndex = 0;
        } else {
            nextIndex = videoIndex + 1;
        }
        videoIndex = nextIndex;
        this.drawPreview();
    },
    drawPreview: function() {
        var loader = $(this.refs.loader.getDOMNode());
        var meta = $(this.refs.meta.getDOMNode());
        loader.show();
        meta.hide();
        var autoPlay = true;
        var elm = $(this.refs.preview.getDOMNode());
        elm.find("img").remove();
        var video = videos[videoIndex];
        var frames = video.frames;
        var img = $('<img/>', { 'src': previewMediaPrefix + video.preview }).hide().css({
            'position': 'absolute',
            'left': 0
        }).appendTo(elm);
        this.setState({
            "video": video.video,
            "duration": video.duration,
            "size": video.size
        });

        var width;

        function defaultPos() {
            img.css('left', -width * frames / 4);
        }

        var step = 0;
        var timeout = 100;
        var reverse = false;
        var action = true;

        img.load(function() {
            $(this).show();
            loader.hide();
            meta.show();
            width = this.width / frames;
            // uncomment if you want preview width to be always equal to frame width
            //elm.css('width', width);
            defaultPos();
            if (autoPlay) {
                goForward();
            }
        });

        function goForward() {
            if (!action) {
                return;
            }
            if (reverse) {
                step -= 1;
                if (step <= 0) {
                    step = 0;
                    reverse = !reverse;
                }
            } else {
                step += 1;
                if (step >= frames-1) {
                    reverse = !reverse;
                }
            }
            var shift = - step * width;
            img.css('left', shift);
            setTimeout(goForward, timeout);
        }

        if (!autoPlay) {
            elm.mouseover(function (e) {
                action = true;
                goForward();
            }).mouseout(function (e) {
                action = false;
                defaultPos();
            });
        }

    },
    componentDidMount: function() {
        this.drawPreview();
    },
    render: function() {
        return (
            <div className="b-form">
                <form id="form" ref="form" onSubmit={this.handleSubmit}>
                    <div className="b-form__row">
                        <input type="text" maxLength="64" autoComplete="off" ref="sender" name="sender" className="b-form__control" placeholder="introduce yourself" onChange={this.handleSenderChange} value={this.state.sender} />
                    </div>
                    <div className="b-form__row">
                        <input type="text" maxLength="64" autoComplete="off" ref="receiver" name="receiver" className="b-form__control" placeholder="introduce receiver" onChange={this.handleReceiverChange} value={this.state.receiver} />
                    </div>
                    <div className="b-form__row b-form__row_preview">
                        <div ref="preview" className="b-video-preview" onClick={this.handlePreviewClick}></div>
                        <img ref="loader" className="b-video-preview__loader" src="public/images/loading-bars.svg" />
                        <span ref="meta" className="b-video-preview__meta"><span>{this.state.size}</span>{(this.state.size && this.state.duration)?", ": ""}<span>{this.state.duration}</span></span>
                        <input type="hidden" name="video" value={this.state.video} />
                        <p onClick={this.handlePreviewClick} className="b-tooltip b-tooltip__left">Click<br />to<br />change</p>
                    </div>
                    <div className="b-form__row b-form__row_text">
                        <textarea maxLength="2000" spellCheck="false" name="text" className="b-form__control" placeholder="write your message" onChange={this.handleTextChange} value={this.state.text}></textarea>
                    </div>
                    <div className="b-form__row_submit">
                        <button type="submit" ref="submit" disabled={this.state.isDisabled} className="b-form__submit">Submit</button>
                    </div>
                </form>
            </div>
        )
    }
});


var MessageHandler = React.createClass({
    mixins: [Router.State, Router.Navigation],
    getInitialState: function() {
        return {
            "exists": true,
            "message": null
        }
    },
    componentDidMount: function() {
        var message = null;
        var messageId = this.getParams()["messageId"];
        if (messageId in messages) {
            message = messages[messageId];
            this.setState({message: message});
            this.setState({loaded: true});
        } else {
            $.get(apiURL + messageId + "/", {}, function(data) {
                this.setState({message: data});
                this.setState({loaded: true});
            }.bind(this), "json").error(function(){
                this.setState({"exists": false})
            }.bind(this));
        }
        this.props.app.resizeVideo();
        this.props.app.updateUrl();
    },
    render: function() {
        if (!this.state.exists) {
            return <NotFoundHandler />
        }
        if (!this.state.message) {
            return (
                <div className="b-page"></div>
            )
        }
        var originalLink = videosByName[this.state.message.video].original;
        var original;
        if (originalLink) {
            original = <VideoOriginal originalLink={originalLink} />;
        } else {
            original = "";
        }
        return (
            <div className="b-page">
                <MessageVideo message={this.state.message} />
                <MessageHeader message={this.state.message} />
                <Message message={this.state.message} />
                {original}
                <Copyright />
            </div>
        )
    }
});

var VideoOriginal = React.createClass({
    render: function() {
        return (
            <div className="b-original">
                <a className="b-original__link" href={this.props.originalLink} target="_blank">Go to original video</a>
            </div>
        )
    }
});

var Copyright = React.createClass({
    render: function() {
        return (
            <div className="b-copyright">
                <a className="b-copyright__text">FZambia, 2015</a>
            </div>
        )
    }
});

var MessageVideo = React.createClass({
    render: function() {
        return (
            <div className="b-video">
                <video loop autoPlay src={videoMediaPrefix + this.props.message.video} className="b-video__player"></video>
                <div className="b-overlay b-overlay_video"></div>
            </div>
        )
    }
});

var MessageHeader = React.createClass({
    render: function() {
        return (
            <div className="b-person">
                <h2 className="b-person__name">
                    {this.props.message.receiver?this.props.message.receiver + ",":""}
                </h2>
                <p className="b-person__descr">
                    {this.props.message.sender?this.props.message.sender:"someone"} sends you a message
                </p>
            </div>
        )
    }
});


var updateInterval;
var animationRunning = false;

var Message = React.createClass({
    update: function(){
        function c() {
            if (!animationRunning) {
                clearInterval(updateInterval);
                return;
            }
            var b = $(".b-text__text"),
                d = $(".b-text__wrapper"),
                e = b.outerHeight() - d.outerHeight(),
                f = 30,
                g = e * f,
                i = 2000,
                j = 1000;

            b.stop().css("margin-top", 0);
            clearInterval(updateInterval);
            b.delay(i).animate({"margin-top": "-" + e + "px"}, g, "linear");
            updateInterval = setTimeout(function () {
                b.animate({"margin-top": "0px"}, j);
                setTimeout(function () {
                    c()
                }, j);
            }, i + g + i);
        }
        setTimeout(function(){
            c();
        }, 2000);
    },
    componentDidMount: function() {
        animationRunning = true;
        this.update();
    },
    componentWillUnmount: function() {
        animationRunning = false;
        clearInterval(updateInterval);
    },
    render: function() {
        return (
            <div className="b-text">
                <div className="b-text__wrapper">
                    <div className="b-text__text">
                        {this.props.message.text}
                    </div>
                </div>
            </div>
        )
    }
});

var routes = (
    <Route handler={App}>
        <DefaultRoute name="main" handler={MainHandler} />
        <Route name="message" path="/message/:messageId" handler={MessageHandler} />
        <NotFoundRoute name="404" handler={NotFoundHandler} />
    </Route>
);

module.exports = function () {
    Router.run(routes, function (Handler, state) {
        React.render(<Handler query={state.query} />, document.body);
    });
};

