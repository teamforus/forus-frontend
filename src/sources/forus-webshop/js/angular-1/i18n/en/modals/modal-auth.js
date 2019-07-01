module.exports = {
    // AUTHENTICATION POPUP = popup-auth.pug
        header: {
            nijmegen: {
                title: "Inloggen bij de Meedoen-regeling",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
            },
            zuidhorn: {
                title: "Inloggen op het Kindpakket",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",                
            },
            westerkwartier: {
                title: "Inloggen op het Kindpakket",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",             
            },
            general: {
                title: "Inloggen op Platform Forus",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
            },
            forus: {
                title: "Inloggen op Platform Forus",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
            }
        },
        notifications: {
            confirmation: "Het is gelukt!",
            link: "Er is een link naar uw e-mailadres gestuurd. Klik op de link om verder te gaan.",
            invalid: "De activatiecode is ongeldig of al gebruikt.",
            voucher_email: "Uw voucher is verstuurd naar uw mail.",
        },
        buttons: {
            qrcode: "Log in via de Me-app",
            mail: "Log in via e-mail",
            submit: "VOLGENDE",
            cancel: "ANNULEREN",
            confirm: "VOLGENDE",
        },
        labels: {
            nijmegen: {
                mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor de Meedoen-regeling per jaar maximaal één activatiecode per e-mailadres gebruiken.",
            },
            zuidhorn: {
                mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor het Kindpakket per jaar maximaal één activatiecode per e-mailadres gebruiken.",
            },
            timelimit: "U wordt automatisch uitgelogd na 15 minuten inactiviteit.",
            warning: "Sluit dit venster en klik op 'Login' als u de activatiecode al eens heeft gebruikt.",
            join: "Aanmelden",
            activate: "Stap 1 van 3: Webshop account aanmaken.",
            activate_code: "Stap 3 van 3: Activeer uw tegoed.",
            scancode: "Scan deze QR-Code met een ander apparaat waar u al op aangemeld bent.",
            mobilecode: "Vul uw toegangscode van de Me-app in.",
            mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor {{fund}} per jaar maximaal één activatiecode per e-mailadres gebruiken.",
            link: "Vul uw e-mailadres in om een link te ontvangen waarmee u kunt inloggen.",
            code: "Vul de activatiecode in die u per brief hebt ontvangen.<br /><strong>Let op:</strong> U kunt één activatiecode per e-mailadres gebruiken. Sluit dit venster als u al een activatiecode heeft gebruikt.",
            voucher_email: "Het is gelukt!",
            isactivated: "Uw voucher is al geactiveerd.",
            codeactivated: "U heeft al een activatiecode gebruikt. Het is niet mogelijk nog één te gebruiken.",
            dont_have_account: "Heeft u geen account en wilt u één aanmaken door een activatiecode te gebruiken?",
        },
        input: {
            mail: "Vul uw e-mailadres in",
            coding: "Vul de activatiecode in",
            code: "Activatiecode",
            mailing: "E-mail",
            confirmation: "Bevestig uw e-mailadres",
        },
        pin_code: {
            confirmation: {
                title: "Is de mobiele app gekoppeld aan uw persoonlijk e-mailadres?",
                description: "Ga naar het tabblad <b>Profiel</b> in de app. Ziet u hier uw e-mailadres staan? Dan is de app succesvol gekoppeld. Als u het tabblad <b>Profiel</b> niet ziet staan, probeer het dan opnieuw.",
                buttons: {
                    try_again: "Opnieuw proberen",
                    confirm: "Volgende"
                }
            }
        }
}