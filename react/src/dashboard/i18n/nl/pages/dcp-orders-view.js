export default {
    header: {
        title: 'DCP bestelling #{{id}}',
        delivery_address: 'Bezorgadres',
        tag_fields: 'Gegevens op de pas',
        history: 'Geschiedenis',
    },
    labels: {
        id: 'ID',
        order_id: 'Ordernummer',
        order_id_dcp: 'Ordernummer DCP',
        status: 'Status bij DCP',
        source: 'Bron',
        implementation: 'Implementatie',
        bulk: 'Bulk',
        label: 'Label',
        item: 'Item',
        attempts: 'Pogingen',
        response_code: 'Laatste antwoordcode',
        created_at: 'Aangemaakt op',
        last_attempt_at: 'Laatste poging op',
        shipped_at: 'Verzonden op',
        payload_edited: 'Handmatig aangepast',
        payload_edited_value: '{{date}} door {{email}}',
        source_field: 'Bron: {{source}}',
        required: 'Verplicht',
        max: 'Maximaal {{max}} tekens',
        missing_required: 'Verplicht veld ontbreekt',
    },
    errors: {
        title: 'De bestelling kan niet worden verstuurd',
        validation_errors: 'Foutmeldingen van DCP:',
        duplicate:
            'DCP had deze bestelling al ontvangen, maar heeft het ordernummer niet teruggestuurd. Vul het ordernummer DCP in om de status van de bestelling te volgen.',
        connection_inactive:
            'De DCP koppeling van de implementatie is uitgeschakeld. De bestelling wordt verstuurd zodra de koppeling weer is ingeschakeld.',
    },
    buttons: {
        refresh: 'Vernieuwen',
        edit: 'Gegevens aanpassen',
        reset: 'Opnieuw ophalen uit aanvraag',
    },
    confirm_reset: {
        title: 'Aanpassingen ongedaan maken',
        description:
            'De handmatige aanpassingen van bestelling #{{id}} worden verwijderd en de gegevens worden opnieuw opgehaald uit de aanvraag.\nWeet u zeker dat u wilt verdergaan?',
        confirm: 'Opnieuw ophalen',
        cancel: 'Annuleren',
    },
    edit: {
        title: 'Gegevens van bestelling #{{id}} aanpassen',
        info: 'De aangepaste gegevens worden zo naar DCP verstuurd, ook als de bestelling opnieuw wordt geprobeerd. Met "Opnieuw ophalen uit aanvraag" maakt u de aanpassingen ongedaan.',
        info_error: 'Klik na het opslaan op "Opnieuw proberen" om de bestelling opnieuw te versturen.',
        cancel: 'Annuleren',
        save: 'Opslaan',
    },
    notifications: {
        updated: 'De gegevens van de bestelling zijn aangepast.',
        reset: 'De gegevens zijn opnieuw opgehaald uit de aanvraag.',
    },
};
