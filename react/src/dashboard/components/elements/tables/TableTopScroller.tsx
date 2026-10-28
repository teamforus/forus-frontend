import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

export default function TableTopScroller({
    children,
    onScroll = null,
    scrollableRootSelector = '.app-root, .app-container',
}: {
    children: ReactElement | ReactElement[];
    onScroll?: () => void;
    scrollableRootSelector?: string;
}) {
    const tableScrollTopRef = useRef<HTMLDivElement>(null);
    const tableScrollWrapperRef = useRef<HTMLDivElement>(null);
    const tableScrollTopContentRef = useRef<HTMLDivElement>(null);

    const [showTopScroll, setShowTopScroll] = useState(false);

    const handleResize = useCallback((enabled = true) => {
        if (enabled && tableScrollTopRef.current && tableScrollWrapperRef.current) {
            tableScrollTopRef.current.style.width = `${tableScrollWrapperRef.current.offsetWidth}px`;
            tableScrollTopContentRef.current.style.width = `${tableScrollWrapperRef.current.scrollWidth}px`;
            tableScrollTopContentRef.current.style.height = `1px`;
        }
    }, []);

    const handlePositionChange = useCallback(() => {
        const el = tableScrollWrapperRef?.current;
        const rect = el?.getBoundingClientRect();
        const screenHeight = window.innerHeight;
        const hasHorizontalScroll = el?.offsetWidth < el?.scrollWidth;

        setShowTopScroll(rect && rect?.bottom > screenHeight && hasHorizontalScroll);
    }, []);

    const updateState = useCallback(() => {
        handleResize();
        handlePositionChange();
    }, [handlePositionChange, handleResize]);

    useEffect(() => {
        const scrollableRoots = document.querySelectorAll(scrollableRootSelector);

        if (!scrollableRoots.length) {
            return;
        }

        updateState();

        window.addEventListener('resize', updateState);
        scrollableRoots.forEach((element) => element.addEventListener('scroll', updateState));

        const observer = new MutationObserver(updateState);

        if (tableScrollWrapperRef.current) {
            const options = {
                childList: true,
                subtree: true,
                characterData: true,
            };

            observer.observe(tableScrollWrapperRef.current, options);
            scrollableRoots.forEach((element) => observer.observe(element, options));
            observer.observe(document.body, options);
        }

        // Cleanup event listener and observer on component unmount
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateState);
            scrollableRoots.forEach((element) => element.removeEventListener('scroll', updateState));
        };
    }, [scrollableRootSelector, updateState]);

    useEffect(() => {
        window.setTimeout(() => {
            tableScrollTopRef?.current?.scrollTo({ left: tableScrollWrapperRef?.current?.scrollLeft });
        }, 0);
    }, [showTopScroll]);

    return (
        <div className="table-wrapper">
            <div className={classNames('table-container', showTopScroll && 'table-container-scroll-top')}>
                {showTopScroll && (
                    <div
                        className="table-scroll-top"
                        ref={tableScrollTopRef}
                        onScroll={(e) => tableScrollWrapperRef.current?.scrollTo({ left: e.currentTarget.scrollLeft })}>
                        <div className="table-scroll-top-content" ref={tableScrollTopContentRef} />
                    </div>
                )}

                <div
                    className="table-scroll"
                    ref={tableScrollWrapperRef}
                    onScroll={(e) => {
                        tableScrollTopRef.current?.scrollTo({ left: e.currentTarget.scrollLeft });
                        onScroll?.();
                    }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
