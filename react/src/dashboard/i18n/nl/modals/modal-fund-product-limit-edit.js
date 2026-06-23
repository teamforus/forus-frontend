export default {
    title: 'Gebruikslimiet toevoegen',
    panes: {
        settings: 'Instellingen',
        products: {
            excluded: 'Uitgesloten producten',
            selected: 'Geselecteerde producten',
        },
    },
    labels: {
        fund: 'Fonds',
        type: 'Selectie type',
        products: {
            excluded: 'Uitgesloten producten',
            selected: 'Geselecteerde producten',
        },
        limit: 'Limiet',
        type_all_except_selected: 'Alle producten behalve geselecteerde producten',
        type_only_selected: 'Alleen geselecteerde producten',
        select_product: 'Zoek of selecteer een product',
    },
    descriptions: {
        products: {
            excluded: 'Voeg hier de producten toe waarop de limiet niet van toepassing is.',
            selected: 'Voeg hier de producten toe waarop de limiet niet van toepassing is. De limiet geldt voor alle producten van dit fonds, behalve de producten die hieronder zijn toegevoegd.',
        },
    },
    info: {
        fund: 'Selecteer het fonds waarvoor een gebruikslimiet wordt ingesteld. De limiet geldt alleen voor de producten binnen het geselecteerde fonds.',
        type: 'Bepaal op welk aanbod de limiet van toepassing is. Bijvoorbeeld: De limiet geldt voor alle producten van het fonds, behalve de producten die onderaan zijn toegevoegd.',
        limit: 'Vul het maximale aantal aanbiedingen in dat binnen deze regeling gekozen kan worden. Bijvoorbeeld: bij een limiet van 1 kan maximaal 1 aanbod gekozen worden.',
    },
    placeholders: {
        limit: 'Limiet',
    },
    buttons: {
        add_product: 'Product toevoegen',
        cancel: 'Annuleer',
        submit: 'Bevestigen',
    },
    notifications: {
        saved: 'Gebruikslimiet opgeslagen.',
    },
};
