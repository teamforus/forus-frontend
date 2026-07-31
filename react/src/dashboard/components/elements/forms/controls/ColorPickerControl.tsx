import React, { useCallback, useId, useMemo, useState } from 'react';
import type { ColorResult } from '@uiw/color-convert';
import ClickOutside from '../../click-outside/ClickOutside';
import PhotoSelectorBannerControlColorPicker from '../../photo-selector/elements/PhotoSelectorBannerControlColorPicker';

const validColorPattern = /^#[a-fA-F0-9]{3,4}$|^#[a-fA-F0-9]{6}$|^#[a-fA-F0-9]{8}$/;

export default function ColorPickerControl({
    id,
    value,
    placeholder,
    onChange,
}: {
    id?: string;
    value?: string | null;
    placeholder?: string;
    onChange: (value: string | null) => void;
}) {
    const dropdownId = useId();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const colorValue = useMemo(() => (typeof value === 'string' ? value : ''), [value]);
    const pickerValue = useMemo(() => {
        return validColorPattern.test(colorValue) ? colorValue : '#ffffff';
    }, [colorValue]);

    const updateColor = useCallback(
        (color: ColorResult) => {
            onChange(color.hsva.a < 1 ? color.hexa : color.hex);
        },
        [onChange],
    );

    return (
        <div className="block block-color-picker-control">
            <button
                className="color-picker-control-button"
                type="button"
                aria-label="Kleur kiezen"
                aria-expanded={isDropdownOpen}
                aria-controls={dropdownId}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span className="color-picker-control-preview" style={{ backgroundColor: pickerValue }} />
                <em className="mdi mdi-chevron-down" aria-hidden="true" />
            </button>
            <input
                id={id}
                className="form-control color-picker-control-input"
                type="text"
                value={colorValue}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value.trim() || null)}
            />
            {isDropdownOpen && (
                <ClickOutside
                    attr={{ id: dropdownId, onClick: (e) => e.stopPropagation() }}
                    className="color-picker-control-dropdown"
                    onClickOutside={() => setIsDropdownOpen(false)}>
                    <PhotoSelectorBannerControlColorPicker
                        color={pickerValue}
                        showAlpha={true}
                        showColorPreview={true}
                        showEditableInput={false}
                        onChange={updateColor}
                    />
                </ClickOutside>
            )}
        </div>
    );
}
