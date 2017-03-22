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
    () => null
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
        (props) => {
            if (props.value) {
                return;
            }

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

const Shallow = React.createClass({
    render() {

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
                <AsyncDeferred stateKey="a" expectedValue="yoyo" />
            </ReactRedux.Provider>
        )
    )
    .then((html) => {
        expect(html).toEqual('<div data-reactroot=\"\" data-reactid=\"1\" data-react-checksum=\"47461724\"><!-- react-text: 2 -->a<!-- /react-text --><!-- react-text: 3 -->=<!-- /react-text --><!-- react-text: 4 -->yoyo<!-- /react-text --></div>');
    });
});
