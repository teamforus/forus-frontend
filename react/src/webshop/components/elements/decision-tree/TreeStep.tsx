import { DecisionOption, TreeNode } from './types/types';
import NodeOptions from './NodeOptions';
import Result from './Result';

type TreeStepProps = {
    node: TreeNode;
    answer?: string;
    onAnswer: (option: DecisionOption) => void;
    applicationUrl?: string;
};

export default function TreeStep({ node, answer, onAnswer, applicationUrl }: TreeStepProps) {
    if (node.type === 'result') {
        return <Result node={node} applicationUrl={applicationUrl} />;
    }

    return (
        <div className="decision-tree-step">
            <h3 className="decision-tree-step-title">{node.label}</h3>

            {node.description && <p className="decision-tree-step-description">{node.description}</p>}

            {['category', 'decision'].includes(node.type) && (
                <NodeOptions options={node.options} selected={answer} onSelect={onAnswer} />
            )}
        </div>
    );
}
