import React from 'react';

type EqualityFn<P> = (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean;

export const withMemo = <P extends object>(
    Component: React.ComponentType<P>,
    propsAreEqual?: EqualityFn<P>
) => {
    const WrappedComponent = React.memo(Component, propsAreEqual);
    
    // Display name için
    const displayName = Component.displayName || Component.name || 'Component';
    WrappedComponent.displayName = `withMemo(${displayName})`;
    
    return WrappedComponent;
}; 