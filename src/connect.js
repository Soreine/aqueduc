/* @flow */
import React from 'react';

type MapPropsToPromise = (props: Object) => ?Promise<*>;

/*
 *
 */
function connect(mapPropsToPromise: MapPropsToPromise) {
    return (Component) => {
        return React.createClass({
            childContextTypes: {
                pushAQPending: React.PropTypes.func
            },

            render() {
                const { pushAQPending } = this.context;
                const { props } = this;
                const promise : ?Promise<*> = mapPropsToPromise(props);

                if (promise) {
                    pushAQPending(promise);
                }

                return <Component {...props} />;
            }
        });
    };
}

export default connect;
