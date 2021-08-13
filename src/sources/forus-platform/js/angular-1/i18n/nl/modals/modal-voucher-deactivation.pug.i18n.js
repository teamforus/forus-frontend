module.exports = {
    title: "Deactiveren",
    description: "Klik op bevestig om de Stadjerspas te deactiveren. Het tegoed is hierna direct niet meer geldig.",
    labels: {
        note: 'Notitie*',
        notify_by_email: 'Informeer de gebruiker via een e-mailbericht.',
    },
    placeholders: {
        note: 'Optionele notitie...',
    },
    hints: {
        note: 'Max. 140 tekens',
    },
    buttons: {
        cancel: 'Annuleer',
        submit: 'Bevestig',
    },
    danger_zone: {
        title: 'Let op! Weet u zeker dat u dit tegoed wilt deactiveren?',
        description_no_email: [
            'Tegoed: {{ fund_name }}',
            '',
            'Na deactivatie kan de gebruiker het tegoed niet meer gebruiken.',
        ].join("\n"),
        description_notification: [
            'U staat op het punt om het tegoed {{ fund_name }} van {{ email }} te deactiveren. Klik op deactiveren als u dit tegoed wilt stoppen.',
            '',
            'De gebruiker ontvangt hiervan een bericht.',
        ].join("\n"),
        description_no_notification: [
            'Tegoed: {{ fund_name }}',
            'E-mailadres: {{ email }}',
            '',
            'Na deactivatie kan de gebruiker het tegoed niet meer gebruiken.',
            'De gebruiker ontvangt na het deactiveren een e-mailbericht.',
        ].join("\n"),
    },
};