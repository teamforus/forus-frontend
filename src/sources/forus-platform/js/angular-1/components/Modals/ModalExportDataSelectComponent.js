const chunk = require('lodash/chunk');

const ModalExportDataComponent = function () {
    const $ctrl = this;

    $ctrl.isValid = true;

    $ctrl.updateSelectedFields = (section, updateIsValid = true) => {
        section.selected = section.fields.filter((field) => field.selected);
        section.selectAll = section.selected.length === section.fields.length;

        if (updateIsValid) {
            $ctrl.updateIsValid($ctrl.sections);
        }

        return section;
    };

    $ctrl.toggleAllFields = (section) => {
        section.selectAll = !section.selectAll;
        section.fields.forEach((field) => field.selected = section.selectAll);

        $ctrl.updateSelectedFields(section);
    };

    $ctrl.updateIsValid = (sections) => {
        const checkboxSections = sections.filter((section) => section.type === 'checkbox');
        const checkboxSectionsChecked = checkboxSections.filter((section) => section.selected.length > 0);

        $ctrl.isValid = !$ctrl.required || (!checkboxSections.length || checkboxSectionsChecked.length);
    };

    $ctrl.collapseSection = (section) => {
        if (section.collapsable) {
            section.collapsed = !section.collapsed;
        }
    };

    $ctrl.onSubmit = () => {
        const { close } = $ctrl.modal;
        const { success } = $ctrl.modal.scope;
        
        const values = $ctrl.sections.reduce((values, section) => {
            if (section.type === 'radio') {
                return { ...values, [section.key]: section.value == 'null' ? null : section.value };
            }

            if (section.type === 'checkbox') {
                return { ...values, [section.key]: section.selected.map((field) => field.key) };
            }

            return values;
        }, {});

        success(values);
        close();
    }

    $ctrl.$onInit = () => {
        const { title, description, sections, required = true } = $ctrl.modal.scope;

        $ctrl.title = title;
        $ctrl.required = required;
        $ctrl.description = description;

        $ctrl.sections = sections.map((section) => {
            const { type, fields, fieldsPerRow } = section;

            if (type == 'checkbox') {
                const fieldsList = fields.map((field) => {
                    const value = field.value == null ? 'null' : field.value;
                    const selectAll = !!section.selectAll;

                    return { ...field, ...{ selected: selectAll || field?.selected, value: value } };
                });

                return { ...section, fieldsView: chunk(fieldsList, fieldsPerRow), fields: fieldsList };
            }

            return section;
        }).map((section) => $ctrl.updateSelectedFields(section, false));

        $ctrl.updateIsValid($ctrl.sections);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: ModalExportDataComponent,
    templateUrl: 'assets/tpl/modals/modal-export-data-select.html',
};