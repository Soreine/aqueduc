/* @flow */

import React from 'react';

type MapPropsToPromise = (props: Object) => ?Promise<*>;
type ComponentWrapper = (React.Component<*,*,*>) => React.Component<*,*,*>;

/*
 *
 */
function connect(
    mapPropsToPromise: MapPropsToPromise
) : ComponentWrapper {
    return (Component) => {

        class AqueducContext extends React.Component {

            /*
             * On browser, we fetch the resources on mount and update.
             */
            componentDidMount() {
                mapPropsToPromise(this.props);
            }

            componentWillReceiveProps(nextProps) {
                mapPropsToPromise(nextProps);
            }

            render() {
                const { enqueueAQPromise } = this.context;
                const { props } = this;

                // On server-side rendering, we prepare for next rendering.
                if (enqueueAQPromise) {
                    const promise : ?Promise<*> = mapPropsToPromise(props);

                    if (promise) {
                        enqueueAQPromise(promise);
                    }
                }

                return <Component {...props} />;
            }
        }

        AqueducContext.contextTypes = {
            enqueueAQPromise: React.PropTypes.func
        };

        return AqueducContext;
    };
}

export default connect;
