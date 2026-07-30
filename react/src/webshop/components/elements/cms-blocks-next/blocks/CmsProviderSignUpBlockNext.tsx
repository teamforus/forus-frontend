import React, { useMemo } from 'react';
import Markdown from '../../markdown/Markdown';
import Section from '../../sections/Section';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import useEnvData from '../../../../hooks/useEnvData';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { stringValue, valueIsTrue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

export default function CmsProviderSignUpBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const appConfigs = useAppConfigs();
    const assetUrl = useAssetUrl();
    const envData = useEnvData();

    const title = stringValue(values.section_title);
    const descriptionHtml = block.values_html?.section_description || '';
    const image = block.media?.image;
    const imageUrl =
        image?.sizes?.large ||
        image?.sizes?.public ||
        image?.sizes?.original ||
        assetUrl('/assets/img/provider-sign_up-preview.svg');
    const buttonText = stringValue(values.button_text);
    const loginText = stringValue(values.login_text);
    const loginLinkText = stringValue(values.login_link_text);
    const showLoginLink = valueIsTrue(values.login_enabled) && Boolean(loginText && loginLinkText);

    const providerPanelUrl = useMemo(() => {
        return appConfigs?.fronts.url_provider || '';
    }, [appConfigs?.fronts.url_provider]);

    const providerSignUpUrl = useMemo(() => {
        return appConfigs?.fronts.url_provider_sign_up || '';
    }, [appConfigs?.fronts.url_provider_sign_up]);

    const signUpUrlParams = useMemo(() => {
        const params = envData.config?.provider_sign_up_filters || {};
        const paramKeys = Object.keys(params);

        return [
            paramKeys.length > 0 ? '?' : '',
            paramKeys.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&'),
        ].join('');
    }, [envData.config?.provider_sign_up_filters]);

    if (!title && !descriptionHtml && !imageUrl && !buttonText) {
        return null;
    }

    return (
        <Section type={'cms-next'} style={cmsSectionStyle(values)} className={cmsSectionClassName(values)}>
            <div className="block block-cms-provider-sign-up">
                <div className="cms-provider-sign-up-overview">
                    <div className="cms-provider-sign-up-content">
                        {title && <h2 className="cms-provider-sign-up-title">{title}</h2>}
                        {descriptionHtml && (
                            <Markdown content={descriptionHtml} className="cms-provider-sign-up-description" />
                        )}
                        {buttonText && (
                            <p className="cms-provider-sign-up-actions">
                                <a
                                    className="button button-primary-outline"
                                    href={providerSignUpUrl + signUpUrlParams}
                                    target="_self">
                                    {buttonText}
                                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                                </a>
                            </p>
                        )}
                        {showLoginLink && (
                            <p className="cms-provider-sign-up-login">
                                {loginText}{' '}
                                <a href={providerPanelUrl} target="_self">
                                    {loginLinkText}
                                </a>
                            </p>
                        )}
                    </div>
                </div>
                {imageUrl && (
                    <div className="cms-provider-sign-up-images">
                        <div className="cms-provider-sign-up-image">
                            <img className="cms-provider-sign-up-image-img" src={imageUrl} alt="" />
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
}
