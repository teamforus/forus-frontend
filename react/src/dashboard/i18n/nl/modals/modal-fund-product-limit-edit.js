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
        limit_by: 'Limiet op basis van',
        limit_by_products: 'Aantal producten',
        limit_by_amount: 'Budget',
        limit_products: 'Limiet',
        limit_amount: 'Budget in euro',
        type_all_except_selected: 'Alle producten behalve geselecteerde producten',
        type_only_selected: 'Alleen geselecteerde producten',
        select_product: 'Zoek of selecteer een product',
    },
    descriptions: {
        products: {
            excluded: 'Voeg hier de producten toe waarop de limiet niet van toepassing is.',
            selected:
                'Voeg hier de producten toe waarop de limiet niet van toepassing is. De limiet geldt voor alle producten van dit fonds, behalve de producten die hieronder zijn toegevoegd.',
        },
    },
    info: {
        fund: 'Selecteer het fonds waarvoor een gebruikslimiet wordt ingesteld. De limiet geldt alleen voor de producten binnen het geselecteerde fonds.',
        type: 'Bepaal op welk aanbod de limiet van toepassing is. Bijvoorbeeld: De limiet geldt voor alle producten van het fonds, behalve de producten die onderaan zijn toegevoegd.',
        limit_by:
            'Kies of de limiet geldt voor het aantal verschillende aanbiedingen of voor het totale bedrag van de gereserveerde aanbiedingen.',
        limit_products:
            'Vul het maximale aantal aanbiedingen in dat binnen deze regeling gekozen kan worden. Bijvoorbeeld: bij een limiet van 1 kan maximaal 1 aanbod gekozen worden.',
        limit_amount:
            'Vul het maximale bedrag in dat binnen deze regeling aan aanbiedingen besteed kan worden. Hetzelfde aanbod kan meerdere keren gekozen worden zolang het budget niet wordt overschreden. Bijvoorbeeld: bij een budget van € 50 kunnen aanbiedingen van € 20 en € 30 gekozen worden, maar daarna geen ander aanbod meer.',
    },
    placeholders: {
        limit_products: 'Limiet',
        limit_amount: 'Bedrag in euro',
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
