import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, {
    type ReactElement,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type DataRenderer<T> = (data: T) => ReactNode;

interface LoaderProps<T> {
    dataPromise: Promise<T>;
    errorMessage?: string | false | ((error: Error) => ReactNode);
    onError?: (error: Error) => void;
    children: DataRenderer<T>;
}

class LoadingState { }

class LoadedState<T> {
    constructor(public readonly data: T) { }
}

class ErroredState {
    constructor(public readonly error: Error) { }
}

type LoadState<T> = LoadingState | LoadedState<T> | ErroredState;

export function LoadData<T>({
    children,
    dataPromise,
    errorMessage = undefined,
    onError = undefined,
}: LoaderProps<T>): ReactElement {
    type PromiseOutcome = { data: T; error?: never } | { data?: never; error: Error };

    const [loadState, setLoadState] = useState<LoadState<T>>(() => new LoadingState());
    const settledPromiseRef = useRef<Promise<PromiseOutcome> | null>(null);

    const handledDataPromise = useMemo(
        () =>
            dataPromise.then(
                (data): PromiseOutcome => ({ data }),
                (error: Error): PromiseOutcome => ({ error }),
            ),
        [dataPromise],
    );

    useEffect(() => {
        let isSubscribed = true;

        function setErroredState(error: Error): void {
            if (!isSubscribed) {
                return;
            }

            if (onError) {
                onError(error);
            }

            settledPromiseRef.current = handledDataPromise;
            setLoadState(new ErroredState(error));
        }

        handledDataPromise.then((outcome) => {
            if (outcome.error) {
                setErroredState(outcome.error);

                return;
            }

            if (!isSubscribed) {
                return;
            }

            settledPromiseRef.current = handledDataPromise;
            setLoadState(new LoadedState(outcome.data));
        });

        return () => {
            isSubscribed = false;
        };
    }, [handledDataPromise, onError]);

    function getErrorMessage(error: Error): ReactNode {
        if (typeof errorMessage === "string") {
            return <p>{errorMessage}</p>;
        }

        if (errorMessage === false) {
            return null;
        }

        if (errorMessage !== undefined) {
            return errorMessage(error);
        }

        return error.toString();
    }

    function content(): ReactNode {
        if (settledPromiseRef.current !== handledDataPromise) {
            return <LoadingPanel />;
        }

        if (loadState instanceof LoadedState) {
            return children(loadState.data);
        }

        if (!(loadState instanceof ErroredState)) {
            return <LoadingPanel />;
        }

        if (errorMessage === false) {
            return null;
        }

        return <Panel status="error">{getErrorMessage(loadState.error)}</Panel>;
    }

    return <>{content()}</>;
}
