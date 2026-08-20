export default {
    title: 'Bankrekening koppelen',
    description: 'Voor welke bankrekening(en) wilt u toestemming geven?',
    labels: {
        account_type: 'Selecteer voor welke bankrekening(en)',
        iban: 'Vul het IBAN in',
    },
    options: {
        all: 'Alle bankrekeningen van uw organisatie',
        single: 'Eén specifieke bankrekening',
    },
    info: {
        account_type:
            'Kies of u toestemming geeft voor één bankrekening of voor alle bankrekeningen van uw organisatie.',
        iban: 'Vul het bankrekeningnummer (IBAN) in waarvoor u toestemming wilt geven. Bijvoorbeeld: NL00ABCD1234567890.',
    },
    placeholders: {
        iban: 'IBAN',
    },
};
