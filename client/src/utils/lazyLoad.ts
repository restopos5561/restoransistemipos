import { lazy } from 'react';

export const lazyLoad = (path: string, namedExport?: string) => {
    return lazy(() => {
        const promise = import(/* @vite-ignore */path);
        if (namedExport == null) {
            return promise;
        } else {
            return promise.then(module => ({ default: module[namedExport] }));
        }
    });
}; 