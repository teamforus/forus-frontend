import { DecisionOption } from './types/types';

export default function NodeOptions({
    options,
    selected,
    onSelect,
}: {
    options: DecisionOption[];
    selected?: string;
    onSelect: (option: DecisionOption) => void;
}) {
    return (
        <div className="decision-tree-step-options">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className={`button ${selected === option.value ? 'button-primary' : 'button-primary-light'}`}
                    onClick={() => onSelect(option)}>
                    {option.label}
                </button>
            ))}
        </div>
    );
}
