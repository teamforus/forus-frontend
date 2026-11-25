export default {
    diagnostic_reference: 'Referentie: {{reference}}',
    title: 'Aanvragergegevens',
    records_title: 'Aanvragergegevens',
    csv_title: 'CSV importeren',
    edit_title: 'Aanvragergegevens bewerken',
    edit_description:
        'Wijzigingen blijven bij de aanvragergegevens totdat u ze overneemt bij Personen. Lege ' +
        'velden wissen de huidige waarden.',
    edit_client_number_hint:
        'Een klantnummer kan eenmalig worden toegevoegd. Na het opslaan kan het niet worden gewijzigd of gewist.',
    edit_panes: {
        records: 'Gegevensvelden',
        read_only: 'Niet-bewerkbare velden',
    },
    edit_save_failed:
        'Het opslaan kon niet worden bevestigd. Sluit dit venster en controleer de ' +
        'vernieuwde gegevens voordat u het opnieuw probeert.',
    empty_value: 'Geen waarde',
    skipped_description:
        'Overgeslagen omdat er geen wijzigingen werden verwacht. Deze rij is niet verstuurd of ' +
        'opnieuw gecontroleerd.',
    skipped_summary:
        'Rijen die bij de verwachte resultaten als ongewijzigd waren gemarkeerd, zijn zonder ' +
        'nieuwe controle overgeslagen.',
    drop_file: 'Of sleep hier een CSV-bestand naartoe',
    parsed_one: '{{count}} rij gelezen uit {{file}}.',
    parsed_other: '{{count}} rijen gelezen uit {{file}}.',
    empty: 'Geen aanvragergegevens gevonden',
    no_enabled_columns: 'Er zijn geen gegevensvelden ingeschakeld voor import. Neem contact op met uw beheerder.',
    status_filter: {
        all: 'Alle statussen',
        empty: 'Geen rijen met deze status',
    },
    labels: {
        bsn: 'BSN',
        given_name: 'Voornaam',
        family_name: 'Achternaam',
        birth_date: 'Geboortedatum',
        client_number: 'Klantnummer',
        updated_at: 'Bijgewerkt',
        search: 'Zoeken',
        file: 'CSV-bestand',
        row: 'Rij',
        column: 'Kolom',
        error: 'Fout',
        result: 'Resultaat',
        actions: 'Acties',
    },
    buttons: {
        sync: 'Personen bijwerken',
        import: 'CSV importeren',
        edit: 'Bewerken',
        save: 'Opslaan',
        choose_file: 'Bestand kiezen',
        template: 'Voorbeeldbestand downloaden',
        remove_file: 'Bestand verwijderen',
        cancel: 'Annuleren',
        back_to_overview: 'Terug naar overzicht',
        stop: 'Stoppen na de huidige batch',
    },
    upload: {
        skip_unchanged: 'Ongewijzigde rijen ({{unchanged}}) overslaan en de overige rijen ({{remaining}}) importeren',
        select: 'CSV selecteren',
        back: 'Terug',
        validate: 'Controleren en bekijken',
        cancel_validation: 'Controle annuleren',
        import_records: 'Gegevens importeren',
        choose_another: 'Ander bestand kiezen',
        validation_errors: 'Validatiefouten',
        correct_errors:
            'Corrigeer deze fouten in uw CSV-bestand en selecteer het bestand opnieuw. ' +
            'Er zijn geen gegevens opgeslagen.',
        validating: 'CSV controleren',
        validation_progress: '{{checked}} van {{total}} rijen gecontroleerd',
        importing: 'Aanvragergegevens importeren',
        progress: '{{processed}} van {{total}} rijen verwerkt',
        results: {
            title: 'Importresultaten',
            download: 'Resultaten downloaden (JSON)',
            previous: 'Vorige waarde',
            saved: 'Opgeslagen waarde',
            column_description:
                'Het resultaat van het importeren van deze rij. Klap de rij uit om ' +
                'opgeslagen wijzigingen of fouten te bekijken.',
            actions: { add: 'Toegevoegd', update: 'Bijgewerkt', clear: 'Gewist' },
            details: {
                created: 'Aanvragergegevens aangemaakt.',
                updated: 'Aanvragergegevens bijgewerkt.',
                unchanged:
                    'De geüploade waarden kwamen overeen met de aanvragergegevens. Er ' +
                    'zijn geen wijzigingen opgeslagen.',
                unsubmitted: 'Deze rij is niet naar de server verstuurd.',
            },
            unknown:
                'Sommige resultaten konden niet worden bevestigd. Controleer de ' +
                'aanvragergegevens voordat u die rijen opnieuw uploadt.',
            unsubmitted: 'Rijen met de status Niet verstuurd zijn niet naar de server verstuurd.',
        },
        preview: {
            title: 'Klaar om te importeren',
            description: 'Alle rijen zijn door de controle gekomen. Bekijk de wijzigingen voordat u importeert.',
            estimate:
                'Verwachte wijzigingen. De gegevens worden bij het importeren opnieuw ' +
                'gecontroleerd, waardoor de resultaten kunnen afwijken.',
            row: 'Rij {{row}}',
            expected: 'Verwacht resultaat',
            field: 'Veld',
            current: 'Huidige waarde',
            uploaded: 'Geüploade waarde',
            action: 'Actie',
            no_changes:
                'De geüploade waarden komen overeen met de lokale gegevens. Er worden geen wijzigingen verwacht.',
            results: { create: 'Wordt aangemaakt', update: 'Wordt bijgewerkt', unchanged: 'Ongewijzigd' },
            actions: { add: 'Toevoegen', update: 'Bijwerken', clear: 'Waarde wissen' },
            columns: {
                row:
                    'Het rijnummer in het CSV-bestand, inclusief de kopregel. Klap een rij ' +
                    'uit om de details te bekijken.',
                bsn: 'Het BSN dat in het CSV-bestand voor deze aanvrager is opgegeven.',
                expected: 'De verwachte wijziging in de lokale aanvragergegevens bij het importeren van deze rij.',
            },
        },
    },
    sync_page: {
        options: 'Eerder overgenomen velden',
        running: 'Personen bijwerken',
        running_description: 'Aanvragergegevens worden overgenomen bij Personen.',
        partial_description:
            'Sommige aanvragergegevens konden niet worden overgenomen bij Personen. Geslaagde ' +
            'wijzigingen zijn opgeslagen.',
        unknown: 'Bijwerken kon niet worden bevestigd',
        unknown_description:
            'Mogelijk zijn er persoonsgegevens bijgewerkt. Controleer Personen voordat u opnieuw ' +
            'gegevens overneemt.',
        requester: 'BSN aanvrager',
        profile: 'Persoon #{{id}}',
        fields_processed: 'Overgenomen velden: {{count}}',
        row_unavailable: 'Deze rij kon niet worden verwerkt. Vermeld de referentie wanneer u om hulp vraagt.',
        columns: {
            requester:
                'Het BSN bij de lokale aanvragergegevens. Klap een rij uit om te zien welke gegevens ' +
                'zijn overgenomen.',
            profile: 'De persoon die binnen de organisatie is toegevoegd of bijgewerkt.',
            result:
                'Of de persoon is toegevoegd, de persoonsgegevens zijn bijgewerkt of ongewijzigd zijn ' +
                'gebleven, of de actie is mislukt.',
            fields_updated: 'Het aantal velden bij Personen waarvoor een nieuwe versie van het gegeven is opgeslagen.',
        },
        details: {
            created: 'Er is een persoon toegevoegd en gekoppeld aan de aanvragergegevens.',
            updated: 'Er zijn nieuwe versies van persoonsgegevens opgeslagen op basis van de geïmporteerde gegevens.',
            linked:
                'De aanvragergegevens zijn gekoppeld aan een bestaande persoon. Er zijn geen ' +
                'veldwaarden gewijzigd.',
            unchanged: 'Er waren geen nieuwe versies van persoonsgegevens nodig.',
        },
        preview: {
            calculate: 'Wijzigingen bekijken',
            calculating: 'Verwachte wijzigingen bij Personen berekenen',
            calculating_description: 'Geïmporteerde gegevens en huidige persoonsgegevens worden gecontroleerd.',
            title: 'Verwachte wijzigingen bij Personen',
            changed_only: 'Alleen nieuwe of gewijzigde velden die nog niet zijn overgenomen',
            estimate:
                'Verwachte wijzigingen. Persoonsgegevens en geïmporteerde gegevens worden bij het ' +
                'overnemen opnieuw gecontroleerd.',
            blocked_notice:
                'Sommige rijen hebben aandacht nodig. Bij het overnemen worden alle rijen opnieuw ' +
                'gecontroleerd en gaat de verwerking door als afzonderlijke rijen mislukken.',
            source_notice:
                'Import als bron vastleggen behoudt dezelfde waarde en voegt een ' +
                'geschiedenisvermelding toe met de aanvragerimport als bron.',
            expected: 'Verwacht resultaat',
            expected_description:
                'De verwachte wijziging bij Personen of de reden waarom deze rij niet kan worden overgenomen.',
            new_profile: 'Nieuwe persoon',
            current: 'Huidige waarde bij Personen',
            imported: 'Geïmporteerde waarde',
            results: {
                create: 'Wordt aangemaakt',
                update: 'Wordt bijgewerkt',
                unchanged: 'Ongewijzigd',
                blocked: 'Aandacht nodig',
            },
            actions: {
                add: 'Toevoegen',
                update: 'Bijwerken',
                clear: 'Waarde wissen',
                confirm_source: 'Import als bron vastleggen',
            },
            create_empty:
                'Er wordt naar verwachting een persoon toegevoegd en gekoppeld. Er hoeven geen velden ' +
                'te worden bijgewerkt.',
            link_existing:
                'De aanvragergegevens worden naar verwachting aan een bestaande persoon gekoppeld. Er ' +
                'hoeven geen velden te worden bijgewerkt.',
            no_changes:
                'Er worden geen nieuwe versies van persoonsgegevens verwacht. De geselecteerde lokale ' +
                'velden worden als verwerkt gemarkeerd.',
        },
    },
    sync: {
        skip_unchanged:
            'Ongewijzigde rijen ({{unchanged}}) overslaan en de overige rijen ({{remaining}}) ' +
            'overnemen bij Personen',
        title: 'Personen bijwerken',
        scope:
            'Voeg nieuwe personen toe of werk bestaande persoonsgegevens bij met de geïmporteerde ' +
            'aanvragergegevens. Alle rijen worden meegenomen, ongeacht zoekfilters of paginering.',
        default_description:
            'Standaard worden alleen nieuwe of gewijzigde velden overgenomen die nog niet bij ' +
            'Personen zijn bijgewerkt.',
        update_all: 'Eerder overgenomen velden opnieuw overnemen',
        update_all_description:
            'Neem ook eerder overgenomen velden opnieuw over uit de aanvragergegevens. Dit kan ' +
            'wijzigingen bij Personen overschrijven. Lege waarden wissen de bijbehorende ' +
            'persoonsgegevens.',
        results_title: 'Resultaten van het bijwerken van personen',
        empty: 'Er zijn geen aanvragergegevens om over te nemen bij Personen.',
        profile: 'Persoon',
        fields_updated: 'Bijgewerkte velden',
    },
    status: {
        parsing: 'Bestand lezen…',
        stopping: 'Stoppen zodra de huidige batch klaar is…',
    },
    results: {
        created: 'Aangemaakt',
        skipped: 'Overgeslagen',
        updated: 'Bijgewerkt',
        unchanged: 'Ongewijzigd',
        failed: 'Mislukt',
        unknown: 'Uitkomst onbekend',
        unsubmitted: 'Niet verstuurd',
    },
    errors: {
        duplicate_header: 'Deze kolom komt meer dan één keer voor.',
        unknown_header: 'Deze kolom is leeg of is niet ingeschakeld voor deze organisatie.',
        missing_bsn: 'De kolom {{column}} is verplicht.',
        column_count: 'Het aantal cellen komt niet overeen met de kopregel.',
        invalid_bsn: 'Voer een geldig BSN van acht of negen cijfers in.',
        invalid_date: 'Voer een geldige datum in met de notatie {{format}}.',
        invalid_option: 'Gebruik een van deze waarden: {{values}}.',
        duplicate_value: 'Deze identificatie komt ook voor in rij {{row}}.',
        no_rows: 'Het bestand bevat geen rijen met aanvragergegevens.',
        read_failed: 'Dit CSV-bestand kon niet worden gelezen.',
        file_type: 'Kies een .csv-bestand.',
        row_failed: 'Deze rij is niet opgeslagen. U kunt het handmatig opnieuw proberen.',
        identifier_conflict: 'Dit BSN of klantnummer is in strijd met bestaande aanvragergegevens.',
        unknown: 'Er is geen bevestigd resultaat ontvangen. Deze rij is mogelijk opgeslagen.',
        batch_rejected: 'Deze batch is niet door de controle gekomen. Geen van de rijen is opgeslagen.',
    },
};
