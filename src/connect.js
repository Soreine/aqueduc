/* @flow */

import React from 'react';

type IsFetchNeeded = (
    props: Object,
    prevProps: ?Object
) => boolean;

type MapPropsToPromise = (
    props: Object
) => Promise<*>;

type Cleanup = (
    props: Object,
    result: ?any
) => ?Promise<*>;

type ComponentWrapper = (ReactClass<*>) => ReactClass<*>;

/*
 *
 */
function connect(
    isFetchNeeded: IsFetchNeeded,
    mapPropsToPromise: MapPropsToPromise,
    cleanup: Cleanup = () => {}
) : ComponentWrapper {
    return (Component: ReactClass<*>) => {

        class AqueducContext extends React.Component {

            /*
             * On browser, we fetch the resources on mount and update.
             */
            componentDidMount() {
                this.fetchAsync(this.props);
            }

            componentWillReceiveProps(nextProps) {
                this.fetchAsync(nextProps, this.props);
            }

            /*
             * Fetch the data and store the cleanup result.
             */
            fetchAsync(props, prevProps) : ?Promise<*> {
                if (!isFetchNeeded(props, prevProps)) {
                    return;
                }

                // Fetch for new props
                const promise : ?Promise<*> = mapPropsToPromise(props, prevProps);

                // Cleanup previous binding
                this.cleanup();

                return promise.then(
                    (result) => {
                        this.promiseExecuted = true;
                        this.promiseResult = result;

                        return result;
                    }
                );
            }

            /*
             * Cleanup the result of the fetch.
             */
            cleanup() {
                if (!this.promiseExecuted) {
                    return;
                }

                cleanup(this.promiseResult, this.props);
            }

            render() {
                const {
                    enqueueAQPromise,
                    enqueueAQCleanup
                } = this.context;
                const { props } = this;

                // On server-side rendering, we prepare for next rendering.
                if (enqueueAQPromise) {
                    const promise : ?Promise<*> = this.fetchAsync(props);

                    if (promise) {
                        enqueueAQPromise(promise);
                        promise.then((result) => {
                            enqueueAQCleanup(() => cleanup(result, props));
                        });
                    }
                }

                return <Component {...props} />;
            }
        }

        AqueducContext.contextTypes = {
            enqueueAQPromise: React.PropTypes.func,
            enqueueAQCleanup: React.PropTypes.func
        };

        return AqueducContext;
    };
}

export default connect;
