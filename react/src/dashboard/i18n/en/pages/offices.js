export default {
    buttons: {
        adjust: 'Edit',
        add: 'Add a new office',
        map: 'View on the map',
        delete: 'Delete',
    },
    labels: {
        mail: 'Email',
        categories: 'Categories',
        nocategories: 'No categories',
        none: 'No data',
        phone: 'Phone number',
        offices: 'Offices',
        business_type: 'Organization type',
        branch_id: 'Branch ID',
        branch_name: 'Branch name',
        branch_number: 'Branch number',
        address: 'Address',
        weekday: 'Day of the week',
        start_time: 'Opening time',
        end_time: 'Closing time',
    },
    tooltips: {
        phone: 'The number where the office or organization can be reached by phone.',
        branch_id: 'A unique ID assigned by the organization to an office for internal administration.',
        branch_name: 'The name used for a specific office.',
        branch_number:
            'A unique 12-digit number assigned by the Chamber of Commerce to each office. ' +
            'This differs from the KVK number.',
        address: 'The physical location address of an office or organization.',
        weekday: 'The day the opening hours apply to, such as Monday, Tuesday, or Sunday.',
        start_time: 'The time when an office opens or becomes reachable.',
        end_time: 'The time when an office closes.',
    },
    confirm_delete: {
        title: 'Are you sure you want to delete this office?',
        description: 'After deleting the office, you cannot undo this action. Consider carefully before continuing.',
    },
    confirm_has_employees: {
        title: 'Remove employees from the office',
        description: 'Before deleting the office, check that no employees are assigned to it.',
        buttons: {
            cancel: 'Close',
            confirm: 'View employees',
        },
    },
    empty: {
        title: 'No offices',
        description: 'You currently have no offices.',
    },
};
