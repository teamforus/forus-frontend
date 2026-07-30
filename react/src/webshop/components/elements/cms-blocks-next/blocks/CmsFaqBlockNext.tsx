import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import Markdown from '../../markdown/Markdown';
import Section from '../../sections/Section';
import ImplementationCmsBlock from '../../../../props/models/ImplementationCmsBlock';
import { stringValue } from '../helpers/values';
import { cmsSectionClassName, cmsSectionStyle } from '../helpers/section';

type FaqQuestion = {
    id: number;
    title: string;
    descriptionHtml: string;
};

type FaqGroup = {
    heading: {
        title: string;
        subtitle: string;
    } | null;
    questions: Array<FaqQuestion>;
};

export default function CmsFaqBlockNext({ block }: { block: ImplementationCmsBlock }) {
    const values = block.values || {};
    const valuesHtml = block.values_html || {};
    const title = stringValue(values.section_title);
    const descriptionHtml = valuesHtml.section_description || '';

    const [visibleFaq, setVisibleFaq] = useState<Record<number, boolean>>({});

    const faqGroups = useMemo((): Array<FaqGroup> => {
        let currentGroup: FaqGroup | null = null;

        return (block.items || [])
            .reduce<Array<FaqGroup>>((groups, item) => {
                const itemValues = item.values || {};
                const itemType = stringValue(itemValues.type);

                if (itemType === 'title') {
                    const groupTitle = stringValue(itemValues.title);

                    if (!groupTitle) {
                        return groups;
                    }

                    currentGroup = {
                        heading: {
                            title: groupTitle,
                            subtitle: stringValue(itemValues.subtitle),
                        },
                        questions: [],
                    };

                    return [...groups, currentGroup];
                }

                if (itemType === 'question') {
                    const questionTitle = stringValue(itemValues.title);
                    const descriptionHtml = item.values_html?.description || '';

                    if (!questionTitle || !descriptionHtml) {
                        return groups;
                    }

                    if (!currentGroup) {
                        currentGroup = { heading: null, questions: [] };
                        groups.push(currentGroup);
                    }

                    currentGroup.questions.push({
                        id: item.id,
                        title: questionTitle,
                        descriptionHtml,
                    });
                }

                return groups;
            }, [])
            .filter((group) => group.questions.length > 0);
    }, [block.items]);

    if (faqGroups.length === 0) {
        return null;
    }

    return (
        <Section type={'cms-next'} style={cmsSectionStyle(values)} className={cmsSectionClassName(values)}>
            <div className="block block-cms-faq">
                {(title || descriptionHtml) && (
                    <div className="cms-faq-intro">
                        {title && <h2 className="cms-faq-section-title">{title}</h2>}
                        {descriptionHtml && (
                            <Markdown className="cms-faq-section-description" content={descriptionHtml} />
                        )}
                    </div>
                )}

                <div className="cms-faq-groups">
                    {faqGroups.map((group, index) => {
                        const GroupHeading = title ? 'h3' : 'h2';
                        const QuestionHeading = group.heading ? (title ? 'h4' : 'h3') : title ? 'h3' : 'h2';

                        return (
                            <div className="cms-faq-group" key={index}>
                                {group.heading && (
                                    <div className="cms-faq-group-header">
                                        <GroupHeading className="cms-faq-group-title">
                                            {group.heading.title}
                                        </GroupHeading>
                                        {group.heading.subtitle && (
                                            <p className="cms-faq-group-subtitle">{group.heading.subtitle}</p>
                                        )}
                                    </div>
                                )}

                                {group.questions.map((item) => {
                                    const expanded = !!visibleFaq[item.id];
                                    const contentId = `cms_faq_item_${item.id}`;

                                    return (
                                        <div key={item.id} className={classNames('cms-faq-item', expanded && 'active')}>
                                            <QuestionHeading className="cms-faq-item-heading">
                                                <button
                                                    type="button"
                                                    className="cms-faq-item-header"
                                                    aria-expanded={expanded}
                                                    aria-controls={contentId}
                                                    onClick={() => {
                                                        setVisibleFaq((list) => ({
                                                            ...list,
                                                            [item.id]: !list[item.id],
                                                        }));
                                                    }}>
                                                    <span className="cms-faq-item-title">{item.title}</span>
                                                    <span className="cms-faq-item-chevron" aria-hidden="true">
                                                        <em
                                                            className={classNames(
                                                                'mdi',
                                                                expanded ? 'mdi-chevron-down' : 'mdi-chevron-right',
                                                            )}
                                                        />
                                                    </span>
                                                </button>
                                            </QuestionHeading>

                                            <div className="cms-faq-item-content" id={contentId} hidden={!expanded}>
                                                <Markdown content={item.descriptionHtml} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Section>
    );
}
