import { useCallback, useMemo, useState } from 'react';
import TreeStep from './TreeStep';
import { DecisionOption, DecisionTreeProp, ORGANIZATION_START } from './types/types';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

type TreeStepState = {
    nodeId: string;
    answer?: string;
};

type Props = {
    commonTree: DecisionTreeProp;
    organizationTrees: Record<string, DecisionTreeProp>;
};

const mergeTrees = (common: DecisionTreeProp, extra: DecisionTreeProp[]): DecisionTreeProp => ({
    start: common.start,
    nodes: Object.assign({}, common.nodes, ...extra.map((tree) => tree.nodes)),
});

type ResolvedTree = {
    tree: DecisionTreeProp;
    organizationStart?: string;
    applicationUrl?: string;
};

const resolveTree = (
    common: DecisionTreeProp,
    subTrees: Record<string, DecisionTreeProp>,
    steps: TreeStepState[],
): ResolvedTree => {
    const active: DecisionTreeProp[] = [];
    let tree = common;
    let organizationStart: string | undefined;
    let applicationUrl: string | undefined;

    for (const step of steps) {
        const nodeId = step.nodeId === ORGANIZATION_START ? organizationStart : step.nodeId;
        const node = nodeId ? tree.nodes[nodeId] : undefined;

        if (step.answer === undefined || !node || node.type === 'result') {
            continue;
        }

        const slug = node.options.find((option) => option.value === step.answer)?.tree;
        const subTree = slug ? subTrees[slug] : undefined;

        if (subTree && !active.includes(subTree)) {
            active.push(subTree);
            tree = mergeTrees(common, active);
            organizationStart = subTree.start;
            applicationUrl = subTree.applicationUrl;
        }
    }

    return { tree, organizationStart: organizationStart, applicationUrl };
};

export function DecisionTree({ commonTree, organizationTrees }: Props) {
    const translate = useTranslate();

    const [steps, setSteps] = useState<TreeStepState[]>([{ nodeId: commonTree.start }]);

    const { tree, organizationStart, applicationUrl } = useMemo(
        () => resolveTree(commonTree, organizationTrees, steps),
        [commonTree, organizationTrees, steps],
    );

    const nodeFor = (nodeId: string) => tree.nodes[nodeId === ORGANIZATION_START ? (organizationStart ?? '') : nodeId];
    const lastNode = nodeFor(steps[steps.length - 1].nodeId);
    const finished = !lastNode || lastNode.type === 'result';

    const handleAnswer = useCallback((stepIndex: number, option: DecisionOption) => {
        setSteps((prev) => [
            ...prev.slice(0, stepIndex),
            { ...prev[stepIndex], answer: option.value },
            { nodeId: option.next },
        ]);
    }, []);

    const restart = useCallback(() => setSteps([{ nodeId: commonTree.start }]), [commonTree.start]);

    return (
        <div className="decision-tree">
            {steps.map((step, index) => {
                const node = nodeFor(step.nodeId);

                if (!node) {
                    return (
                        <div
                            key={`${step.nodeId}-${index}`}
                            role="alert"
                            className="decision-tree-result decision-tree-result-not-eligible">
                            {translate('block_decision_tree.route_not_available')}
                        </div>
                    );
                }

                return (
                    <TreeStep
                        key={`${step.nodeId}-${index}`}
                        node={node}
                        answer={step.answer}
                        applicationUrl={applicationUrl}
                        onAnswer={(option) => handleAnswer(index, option)}
                    />
                );
            })}

            {finished && (
                <div>
                    <button type="button" className="button button-primary" onClick={restart}>
                        {translate('block_decision_tree.restart')}
                    </button>
                </div>
            )}
        </div>
    );
}
