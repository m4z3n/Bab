/**
 * This view acts as a wrapper for all the other views in the game
 * it is subscribed to changes in EngineVirtualStore but it only
 * listen to connection changes so every view should subscribe to
 * EngineVirtualStore independently.
 */
define([
    'react',
    'components/TopBar',
    'components/ChartControls',
    'components/TabsSelector',
    'components/Players',
    'components/BetBar',
    'game-logic/clib',
    'game-logic/hotkeys',
    'stores/GameSettingsStore'
], function(
    React,
    TopBarClass,
    ChartControlsClass,
    TabsSelectorClass,
    PlayersClass,
    BetBarClass,
    Clib,
    Hotkeys,
    GameSettingsStore
){
    var TopBar = React.createFactory(TopBarClass);
    var ChartControls = React.createFactory(ChartControlsClass);
    var TabsSelector = React.createFactory(TabsSelectorClass);
    var Players = React.createFactory(PlayersClass);
    var BetBar = React.createFactory(BetBarClass);

    var D = React.DOM;

    return React.createClass({
        displayName: 'Game',

        getInitialState: function () {
            var state = GameSettingsStore.getState();
            state.showMessage = true;
            state.isMobileOrSmall = Clib.isMobileOrSmall(); //bool
            return state;
        },

        componentDidMount: function() {
            GameSettingsStore.addChangeListener(this._onSettingsChange);

            window.addEventListener("resize", this._onWindowResize);

            Hotkeys.mount();
        },

        componentWillUnmount: function() {
            GameSettingsStore.removeChangeListener(this._onSettingsChange);

            window.removeEventListener("resize", this._onWindowResize);

            Hotkeys.unmount();
        },

        _onSettingsChange: function() {
            if(this.isMounted())
                this.setState(GameSettingsStore.getState());
        },

        _onWindowResize: function() {
            var isMobileOrSmall = Clib.isMobileOrSmall();
            if(this.state.isMobileOrSmall !== isMobileOrSmall)
                this.setState({ isMobileOrSmall: isMobileOrSmall });
        },

        _hideMessage: function() {
            this.setState({ showMessage: false });
        },

        render: function() {

            var messageContainer;
            if(USER_MESSAGE && this.state.showMessage) {

                var messageContent, messageClass, containerClass = 'show-message';
                switch(USER_MESSAGE.type) {
                    case 'error':
                        messageContent = D.span(null,
                            D.span(null, USER_MESSAGE.text)
                        );
                        messageClass = 'error';
                        break;
                    case 'newUser':
                        messageContent = D.span(null,
                            D.a({ href: "/request" }, "Welcome to bustabit.com, to start you can request 2 free bits or you  just watch the current games... have fun :D")
                        );
                        messageClass = 'new-user';
                        break;
                    case 'received':
                        messageContent = D.span(null,
                            D.span(null, "Congratulations you have been credited " +  USER_MESSAGE.qty +  " free bits. Have fun!")
                        );
                        messageClass = 'received';
                        break;
                    case 'advice':
                        messageContent = D.span(null,
                            D.span(null, USER_MESSAGE.advice)
                        );
                        messageClass = 'advice';
                        break;
                    case 'collect':
                        messageContent = D.span(null,
                            D.a({ href: '/request' }, 'Collect your two free bits!')
                        );
                        messageClass = 'collect';
                        break;
                    default:
                        messageContent = null;
                        messageClass = 'hide';
                        containerClass = '';
                }

                messageContainer = D.div({ id: 'game-message-container', className: messageClass },
                    messageContent,
                    D.a({ className: 'close-message', onClick: this._hideMessage }, D.i({ className: 'fa fa-times' }))
                )
            } else {
                messageContainer = null;
                containerClass = '';
            }

            var rightContainer = !this.state.isMobileOrSmall?
                D.div({ id: 'game-right-container' },
                    Players(),
                    BetBar()
                ) : null;

            return D.div({ id: 'game-inner-container' },

                TopBar({
                    isMobileOrSmall: this.state.isMobileOrSmall
                }),

                messageContainer,

                D.div({ id: 'game-playable-container', className: containerClass },

                    //Chat and Controls
                    D.div({ id: 'game-left-container', className: this.state.isMobileOrSmall? ' small-window' : '' },
                        D.div({ id: 'chart-controls-row' },
                            D.div({ id: 'chart-controls-col', className: this.state.controlsSize },
                                D.div({ className: 'cell-wrapper' },
                                    ChartControls({
                                        isMobileOrSmall: this.state.isMobileOrSmall,
                                        controlsSize: this.state.controlsSize
                                    })
                                )
                            )
                        ),

                        //Chat, History, etc...
                        D.div({ id: 'tabs-controls-row' },
                            D.div({ id: 'tabs-controls-col' },
                                D.div({ className: 'cell-wrapper' },
                                    TabsSelector({
                                        isMobileOrSmall: this.state.isMobileOrSmall,
                                        controlsSize: this.state.controlsSize
                                    })
                                )
                            )
                        )

                    ),

                    //Players
                    rightContainer
                )
            );
        }
    });

});