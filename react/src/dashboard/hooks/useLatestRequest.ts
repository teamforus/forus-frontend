import { useCallback, useEffect, useRef } from 'react';
import { RequestConfigData } from '../props/ApiResponses';

export type LatestRequestHandlers<T> = {
    onStart?: () => void;
    onSuccess?: (result: T) => void;
    onError?: (error: unknown) => void;
    onFinally?: () => void;
};

export type LatestRequestRunner = <T>(
    request: (config?: RequestConfigData) => Promise<T>,
    handlers?: LatestRequestHandlers<T>,
) => void;

export default function useLatestRequest(): LatestRequestRunner {
    const requestIndexRef = useRef(0);
    const mountedRef = useRef(false);
    const xhrsRef = useRef<Set<XMLHttpRequest>>(new Set());

    const abortXhrs = useCallback(() => {
        xhrsRef.current.forEach((xhr) => xhr.abort());
        xhrsRef.current.clear();
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            abortXhrs();
        };
    }, [abortXhrs]);

    return useCallback<LatestRequestRunner>(
        async (request, handlers = {}) => {
            const requestIndex = ++requestIndexRef.current;
            const isLatestRequest = () => mountedRef.current && requestIndex === requestIndexRef.current;
            const isLatestRequestIndex = () => requestIndex === requestIndexRef.current;

            const requestConfig: RequestConfigData = {
                onAbort: function (this: XMLHttpRequest) {
                    if (requestIndex === requestIndexRef.current) {
                        xhrsRef.current.delete(this);
                    }
                },
                onXhr: (xhr) => {
                    if (requestIndex === requestIndexRef.current) {
                        xhrsRef.current.add(xhr);
                        xhr.addEventListener('loadend', () => xhrsRef.current.delete(xhr), { once: true });
                    }
                },
            };

            abortXhrs();
            handlers.onStart?.();

            try {
                try {
                    await Promise.resolve();
                    const result = await request(requestConfig);

                    if (isLatestRequest()) {
                        handlers.onSuccess?.(result);
                    }

                    return result;
                } catch (error) {
                    if (isLatestRequest()) {
                        handlers.onError?.(error);
                    }
                }
            } finally {
                if (isLatestRequestIndex()) {
                    xhrsRef.current.clear();

                    if (mountedRef.current) {
                        handlers.onFinally?.();
                    }
                }
            }
        },
        [abortXhrs],
    );
}
