/* @flow */

import React from 'react';

type MapPropsToPromise = (
    props: Object,
    prevProps: ?Object
) => ?Promise<*>;

type Cleanup = (
    props: Object
) => ?Promise<*>;

type ComponentWrapper = (ReactClass<*>) => ReactClass<*>;

/*
 *
 */
function connect(
    mapPropsToPromise: MapPropsToPromise,
    cleanup: Cleanup = () => {}
) : ComponentWrapper {
    return (Component: ReactClass<*>) => {

        class AqueducContext extends React.Component {

            /*
             * On browser, we fetch the resources on mount and update.
             */
            componentDidMount() {
                mapPropsToPromise(this.props);
            }

            componentWillReceiveProps(nextProps) {
                mapPropsToPromise(nextProps, this.props);
            }

            componentWillUnmount() {
                cleanup(this.props);
            }

            render() {
                const {
                    enqueueAQPromise,
                    enququeAQCleanup
                } = this.context;
                const { props } = this;

                // On server-side rendering, we prepare for next rendering.
                if (enqueueAQPromise) {
                    const promise : ?Promise<*> = mapPropsToPromise(props);

                    if (promise) {
                        enqueueAQPromise(promise);
                        enququeAQCleanup(() => cleanup(props));
                    }
                }

                return <Component {...props} />;
            }
        }

        AqueducContext.contextTypes = {
            enqueueAQPromise: React.PropTypes.func,
            enququeAQCleanup: React.PropTypes.func
        };

        return AqueducContext;
    };
}

export default connect;
