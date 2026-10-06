export const ORGANIZATION_START = '@organization-start';

export type DecisionOption = {
    label: string;
    value: string;
    next: string;
    tree?: string;
};

type ChoiceBase = {
    id: string;
    label: string;
    description?: string;
    options: DecisionOption[];
};

export type DecisionNode = ChoiceBase & { type: 'decision' };
export type CategoryNode = ChoiceBase & { type: 'category' };

export type ResultNode = {
    type: 'result';
    id: string;
    label: string;
    description?: string;
    eligible: boolean;
    button: boolean;
};

export type TreeNode = DecisionNode | CategoryNode | ResultNode;

export type DecisionTreeProp = {
    start: string;
    nodes: Record<string, TreeNode>;
    applicationUrl?: string;
};

export type DecisionTreesPayload = {
    common: DecisionTreeProp;
    organizationTrees: Record<string, DecisionTreeProp>;
};
