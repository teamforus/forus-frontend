import { useState } from 'react';
import type ApiResponse from '../props/ApiResponses';

type RecursiveLeachRequest<T> = (page: number, lastPage: number | null, concurrency: number) => Promise<ApiResponse<T>>;

export class HelperService {
    public recursiveLeach<T>(
        request: RecursiveLeachRequest<T>,
        concurrency = 1,
        page = 1,
        last_page: number | null = null,
        data: Array<T> = [],
    ): Promise<Array<T>> {
        return new Promise((resolve, reject) => {
            const requests: Array<Promise<ApiResponse<T>>> = [];
            const _maxConcurrency = Math.max(1, concurrency);
            const _concurrency = last_page === null ? 1 : Math.min(_maxConcurrency, Math.max(last_page - page + 1, 1));

            for (let requestIndex = 0; requestIndex < _concurrency; requestIndex++) {
                requests.push(request(page + requestIndex, last_page, _concurrency));
            }

            return Promise.all(requests).then((res) => {
                const lastPage = res[0].data.meta.last_page;
                const _data = data.concat(res.reduce<Array<T>>((arr, __data) => arr.concat(__data.data.data), []));

                if (page + (_concurrency - 1) >= lastPage) {
                    resolve(_data);
                } else {
                    this.recursiveLeach<T>(request, concurrency, page + _concurrency, lastPage, _data).then(
                        resolve,
                        reject,
                    );
                }
            }, reject);
        });
    }

    public openInNewTab(url?: string) {
        return url ? window.open(url, '_blank').focus() : null;
    }

    public getEmailServiceProviderUrl(email?: string) {
        const host = email ? email.split('@').splice(-1)[0] : '';
        const provider = typeof host === 'string' ? host.toLocaleLowerCase().trim() : null;

        const providersList = [
            'aol.com',
            'fastmail.com',
            'googlemail.com',
            'gmail.com',
            'gmx.net',
            'gmx.de',
            'hotmail.com',
            'icloud.com',
            'inbox.com',
            'mail.com',
            'mail.ru',
            'me.com',
            'outlook.com',
            'protonmail.com',
            'yahoo.com',
            'yandex.ru',
        ];

        return provider && providersList.includes(provider) ? 'https://' + provider : null;
    }

    public focusElement(element: HTMLElement) {
        const link = document.createElement('a');
        link.href = '#';
        element?.prepend(link);
        link.focus();
        link.remove();
    }
}

export function useHelperService(): HelperService {
    return useState(new HelperService())[0];
}
