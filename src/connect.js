/* @flow */

import React from 'react';

type MapPropsToPromise = (props: Object) => ?Promise<*>;
type ComponentConstructor = () => React.Component;

/*
 *
 */
function connect(
    mapPropsToPromise: MapPropsToPromise
) : ComponentConstructor {
    return (Component) => {
        return React.createClass({
            childContextTypes: {
                pushAQPending: React.PropTypes.func
            },

            /*
             * On browser, we fetch the resources on mount and update.
             */
            componentDidMount() {
                mapPropsToPromise(this.props);
            },

            componentWillReceiveProps(nextProps) {
                mapPropsToPromise(nextProps);
            },

            render() {
                const { pushAQPending } = this.context;
                const { props } = this;

                // On server-side rendering, we prepare for next rendering.
                if (pushAQPending) {
                    const promise : ?Promise<*> = mapPropsToPromise(props);

                    if (promise) {
                        pushAQPending(promise);
                    }
                }

                return <Component {...props} />;
            }
        });
    };
}

export default connect;
