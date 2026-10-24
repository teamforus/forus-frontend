import { useCallback, useEffect, useState } from 'react';
import { DecisionTree } from './DecisionTree';
import { DecisionTreesPayload } from './types/types';
import { useDecisionTreeService } from '../../../services/DecisionTreeService';

export default function DecisionTreeLoader() {
    const decisionTreeService = useDecisionTreeService();

    const [data, setData] = useState<DecisionTreesPayload | null>(null);

    const fetchDecisionTrees = useCallback(() => {
        decisionTreeService
            .list()
            .then((res) => setData(res.data))
            .catch((e) => console.error(e));
    }, [decisionTreeService]);

    useEffect(() => {
        fetchDecisionTrees();
    }, [fetchDecisionTrees]);

    if (!data || !data?.common || !data?.organizationTrees) {
        return null;
    }

    return <DecisionTree commonTree={data.common} organizationTrees={data.organizationTrees} />;
}
