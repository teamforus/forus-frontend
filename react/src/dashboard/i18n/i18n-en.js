import components from './en/i18n-components';
import modals from './en/i18n-modals';
import pages from './en/i18n-pages';

export default {
    organizations: {
        title: 'Kies een organisatie om in te loggen',
    },
    form: {
        placeholders: {
            select_option: 'Select option',
        },
    },

    components,

    // PAGES
    ...pages,
    products: {
        all: 'All',
    },

    // MODALS
    modals: {
        ...modals,
    },
    validation_request_details: {
        profile_copy_preview: {
            title: 'Profile changes',
            loading: 'Loading profile changes',
            estimate:
                'Estimated changes. Profile values are checked again on approval. Blank application ' +
                'fields leave existing profile values unchanged.',
            new_profile: 'A profile will be created on approval.',
            disabled: 'Application data will not be copied to the profile.',
            empty: 'No supported application fields are available to copy.',
            columns: {
                field: 'Field',
                current: 'Current profile value',
                value: 'Application value',
                action: 'Action',
            },
            tooltips: {
                field: 'The profile field that may receive application data.',
                current: 'The saved profile value used to determine the change.',
                value: 'The application value prepared for the profile.',
                action: 'The expected change when the application is approved.',
            },
            actions: {
                add: 'Add',
                update: 'Update',
                unchanged: 'Unchanged',
                not_copied: 'Not copied',
            },
        },
        labels: {
            copy_to_profile: 'Copy application data to the profile',
        },
    },
    page_state_titles: {
        'voucher-passes-dcp': 'Prepare print orders',
        'dcp-orders': 'Print orders',
        'dcp-order': 'Print order details',
        'dcp-order-bulk': 'Print bulk details',
    },
};
