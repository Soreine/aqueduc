/* eslint react/prop-types: 0 */
import React from 'react';
import * as ReactRedux from 'react-redux';

import createTestStore from './utils/createTestStore';
import connect from '../connect';
import render from '../render';

const Sync = React.createClass({
    render() {
        return <div>Hello</div>;
    }
});

const SyncNoOp = connect(
    () => false,
    () => new Promise()
)(React.createClass({
    render() {
        return <div>Hello</div>;
    }
}));

const AsyncDeferred = ReactRedux.connect(
    (state, props) => {
        return { value: state[props.stateKey] };
    }
)(
    connect(
        props => (
            !props.value
        ),
        (props) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    props.dispatch({
                        type: 'set',
                        key: props.stateKey,
                        value: props.expectedValue
                    });
                    resolve();
                }, 10);
            });
        }
    )(
        React.createClass({
            render() {
                return <div>{this.props.stateKey}={this.props.value}</div>;
            }
        })
    )
);

// For testing async component in cascade
const AsyncDeferredDeep = ReactRedux.connect(
    (state, props) => {
        return { value: state[props.stateKey] };
    }
)(
    connect(
        props => (
            !props.value
        ),
        (props) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    props.dispatch({
                        type: 'set',
                        key: props.stateKey,
                        value: props.expectedValue
                    });
                    resolve();
                }, 10);
            });
        }
    )(
        React.createClass({
            render() {
                const { depth, stateKey, value } = this.props;
                if (!value) {
                    return null;
                }

                if (depth == 0) {
                    return <div>{stateKey}={value}</div>;
                }

                return (
                    <AsyncDeferredDeep
                        stateKey={`${stateKey}${depth}`}
                        expectedValue={value + 1}
                        depth={depth - 1}
                        />
                );
            }
        })
    )
);


const AsyncDeferredWithCleanup = ReactRedux.connect(
    (state, props) => {
        return { value: state[props.stateKey] };
    }
)(
    connect(
        props => (
            !props.value
        ),
        (props) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    props.dispatch({
                        type: 'set',
                        key: props.stateKey,
                        value: props.expectedValue
                    });
                    resolve();
                }, 10);
            });
        },
        (result, props) => {
            props.dispatch({
                type: 'set',
                key: props.stateKey,
                value: null
            });
        }
    )(
        React.createClass({
            render() {
                return <div>{this.props.stateKey}={this.props.value}</div>;
            }
        })
    )
);


const AsyncDeferredWithCleanupResult = ReactRedux.connect(
    (state, props) => {
        return { value: state[props.stateKey] };
    }
)(
    connect(
        props => (
            !props.value
        ),
        (props) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    props.dispatch({
                        type: 'set',
                        key: props.stateKey,
                        value: props.expectedValue
                    });
                    resolve();
                }, 10);
            })
            .then(() => {
                return () => {
                    props.dispatch({
                        type: 'set',
                        key: props.stateKey,
                        value: null
                    });
                };
            });
        },
        (off, props) => {
            off();
        }
    )(
        React.createClass({
            render() {
                return <div>{this.props.stateKey}={this.props.value}</div>;
            }
        })
    )
);

const AsyncDeferredWithContext = ReactRedux.connect(
    (state, props) => {
        return { value: state[props.stateKey] };
    }
)(
    connect(
        (props, prevProps, context) => {
            return !props.value && context.stateKey;
        },
        (props, prevProps, context) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    props.dispatch({
                        type: 'set',
                        key: context.stateKey,
                        value: props.expectedValue
                    });
                    resolve();
                }, 10);
            });
        },
        (result, props, context) => {
            props.dispatch({
                type: 'set',
                key: context.stateKey,
                value: null
            });
        },
        { withContext: true }
    )(
        React.createClass({
            contextTypes: {
                stateKey: React.PropTypes.string
            },
            render() {
                return <div>{this.context.stateKey}={this.props.value}</div>;
            }
        })
    )
);


// Pass stateKey as a context
const ContextProvider = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        stateKey: React.PropTypes.string
    },

    childContextTypes: {
        stateKey: React.PropTypes.string
    },

    getChildContext() {
        const { stateKey } = this.props;
        return {
            stateKey
        };
    },

    render() {
        const { children } = this.props;
        return React.Children.only(children);
    }
});

it('should render when no async components', () => {
    return render(
        () => <Sync />
    )
    .then((html) => {
        expect(html).toEqual('<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"-880209586\">Hello</div>');
    });
});

it('should render when async components to no-op', () => {
    return render(
        () => <SyncNoOp />
    )
    .then((html) => {
        expect(html).toEqual('<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"-880209586\">Hello</div>');
    });
});

it('should render top-level async component', () => {
    const store = createTestStore();

    return render(
        () => (
            <ReactRedux.Provider store={store}>
                <AsyncDeferred
                    stateKey="a"
                    expectedValue="yoyo"
                    />
            </ReactRedux.Provider>
        )
    )
    .then((html) => {
        expect(html).toEqual('<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"47461724\"><!-- react-text: 2 -->a<!-- /react-text --><!-- react-text: 3 -->=<!-- /react-text --><!-- react-text: 4 -->yoyo<!-- /react-text --></div>');
    });
});


it('should render cascade of async components', () => {
    const store = createTestStore();

    return render(
        () => (
            <ReactRedux.Provider store={store}>
                <AsyncDeferredDeep
                    stateKey="b"
                    expectedValue={1}
                    depth={4}
                    />
            </ReactRedux.Provider>
        )
    )
    .then((html) => {
        expect(html).toEqual('<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"-75090804\"><!-- react-text: 2 -->b4321<!-- /react-text --><!-- react-text: 3 -->=<!-- /react-text --><!-- react-text: 4 -->5<!-- /react-text --></div>');
    });
});

it('should call cleanup (shallow)', () => {
    const store = createTestStore();

    return render(
        () => (
            <ReactRedux.Provider store={store}>
                <AsyncDeferredWithCleanup
                    stateKey="a"
                    expectedValue="yoyo"
                    />
            </ReactRedux.Provider>
        )
    )
    .then((html) => {
        expect(html).toEqual('<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"47461724\"><!-- react-text: 2 -->a<!-- /react-text --><!-- react-text: 3 -->=<!-- /react-text --><!-- react-text: 4 -->yoyo<!-- /react-text --></div>');
        expect(store.getState()).toEqual({ a: null });
    });
});

it('should call cleanup with result (shallow)', () => {
    const store = createTestStore();

    return render(
        () => (
            <ReactRedux.Provider store={store}>
                <AsyncDeferredWithCleanupResult
                    stateKey="a"
                    expectedValue="yoyo"
                    />
            </ReactRedux.Provider>
        )
    )
    .then((html) => {
        expect(html).toEqual('<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"47461724\"><!-- react-text: 2 -->a<!-- /react-text --><!-- react-text: 3 -->=<!-- /react-text --><!-- react-text: 4 -->yoyo<!-- /react-text --></div>');
        expect(store.getState()).toEqual({ a: null });
    });
});

it('should pass context if "withContext" is true', () => {
    const store = createTestStore();

    return render(
        () => (
            <ReactRedux.Provider store={store}>
                <ContextProvider stateKey="a">
                    <AsyncDeferredWithContext
                        stateKey="a"
                        expectedValue="yoyo"
                        />
                </ContextProvider>
            </ReactRedux.Provider>
        )
    )
    .then((html) => {
        expect(html).toEqual('<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"47461724\"><!-- react-text: 2 -->a<!-- /react-text --><!-- react-text: 3 -->=<!-- /react-text --><!-- react-text: 4 -->yoyo<!-- /react-text --></div>');
        expect(store.getState()).toEqual({ a: null });
    });
});
