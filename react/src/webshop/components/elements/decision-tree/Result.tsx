import { ResultNode } from './types/types';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

type ResultProps = {
    node: ResultNode;
    applicationUrl?: string;
};

export default function Result({ node, applicationUrl }: ResultProps) {
    const translate = useTranslate();

    return (
        <div
            className={
                node.eligible
                    ? 'decision-tree-result decision-tree-result-eligible'
                    : 'decision-tree-result decision-tree-result-not-eligible'
            }>
            <p className="decision-tree-result-title">{node.label}</p>

            {node.description && <p className="decision-tree-result-description">{node.description}</p>}

            {node.button && applicationUrl && (
                <a className="button button-primary" href={applicationUrl} target="_blank" rel="noopener noreferrer">
                    {translate('block_decision_tree.open_application_link')}
                </a>
            )}
        </div>
    );
}
