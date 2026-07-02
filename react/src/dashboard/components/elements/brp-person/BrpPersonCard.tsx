import React, { Fragment, useCallback, useState } from 'react';
import classNames from 'classnames';
import useTranslate from '../../../hooks/useTranslate';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import IdentitiesApiPerson from '../../../props/models/IdentitiesApiPerson';
import { ApiResponseSingle } from '../../../props/ApiResponses';
import Card from '../card/Card';
import EmptyCard from '../empty-card/EmptyCard';

type BrpPersonState = {
    bsn_expanded?: boolean;
    person?: IdentitiesApiPerson;
    person_relative?: IdentitiesApiPerson;
    person_breadcrumbs?: Array<IdentitiesApiPerson>;
};

type BrpPersonRelationKey = 'parents' | 'partners' | 'children';

export default function BrpPersonCard({
    fetchPerson,
}: {
    fetchPerson: (data?: object) => Promise<ApiResponseSingle<IdentitiesApiPerson>>;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const [person, setPerson] = useState<BrpPersonState>({});
    const [fetchingPerson, setFetchingPerson] = useState(false);

    const syncPersonBreadcrumbs = (person: BrpPersonState): BrpPersonState => ({
        ...person,
        person_breadcrumbs: [person.person, person.person_relative ? person.person_relative : null].filter(
            (item) => item,
        ),
    });

    const closePerson = useCallback(() => {
        setPerson((person) => ({ ...person, bsn_expanded: false }));
    }, []);

    const fetchBrpPerson = useCallback(
        (person: BrpPersonState, scope?: BrpPersonRelationKey, scope_id?: number) => {
            const fetchingRelative = scope && scope_id;
            const data = fetchingRelative ? { scope, scope_id } : {};

            if (fetchingPerson) {
                return;
            }

            if (!fetchingRelative && person.person) {
                setPerson(
                    syncPersonBreadcrumbs({
                        ...person,
                        bsn_expanded: true,
                        person_relative: null,
                    }),
                );

                return;
            }

            setFetchingPerson(true);
            setProgress(0);

            fetchPerson(data)
                .then((res) => {
                    setPerson(
                        syncPersonBreadcrumbs({
                            ...person,
                            bsn_expanded: true,
                            ...(fetchingRelative ? { person_relative: res.data.data } : { person: res.data.data }),
                        }),
                    );
                })
                .catch(pushApiError)
                .finally(() => {
                    setFetchingPerson(false);
                    setProgress(100);
                });
        },
        [fetchPerson, fetchingPerson, pushApiError, setProgress],
    );

    return (
        <Card
            title={'Persoonlijke gegevens'}
            buttons={[
                person.bsn_expanded
                    ? {
                          text: 'Sluiten',
                          icon: 'close',
                          disabled: fetchingPerson,
                          onClick: closePerson,
                      }
                    : {
                          type: 'primary',
                          text: 'Bekijken',
                          icon: 'format-list-bulleted',
                          disabled: fetchingPerson,
                          onClick: () => fetchBrpPerson(person),
                      },
            ]}>
            {person.person && person.bsn_expanded ? (
                <Fragment>
                    <div className="block block-breadcrumbs">
                        {person.person_breadcrumbs.map((breadcrumb, index) => (
                            <div
                                key={index}
                                className={classNames(
                                    'breadcrumb-item',
                                    index == person.person_breadcrumbs.length - 1 && 'active',
                                )}
                                onClick={(e) => (index == 0 ? fetchBrpPerson(person) : e.preventDefault())}>
                                {breadcrumb.name}
                            </div>
                        ))}
                    </div>
                    <div className="row">
                        <div className="col col-lg-6 col-sm-12">
                            <div className="card-block card-block-keyvalue">
                                {(person?.person_relative || person.person).fields.map((field, index) => (
                                    <div key={index} className="keyvalue-item">
                                        <div className="keyvalue-key">{field.label}</div>
                                        <div
                                            className={classNames(
                                                'keyvalue-value',
                                                'text-pre-line',
                                                field.value == null && 'text-muted',
                                            )}>
                                            {field?.value || 'Geen data'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col col-lg-6 col-sm-12">
                            {!person.person_relative &&
                                Object.keys(person.person?.relations).map((relationsListKey: BrpPersonRelationKey) => (
                                    <div key={relationsListKey} className="card-block card-block-keyvalue">
                                        {person.person?.relations[relationsListKey].map((relation, index: number) => (
                                            <div key={index} className="keyvalue-item">
                                                <div className="keyvalue-key">
                                                    {translate(
                                                        `validation_requests.person.relations.${relationsListKey}`,
                                                        {
                                                            index: index + 1,
                                                        },
                                                    )}
                                                </div>
                                                <a
                                                    className="keyvalue-value card-text-link"
                                                    onClick={(e) => {
                                                        e?.preventDefault();
                                                        fetchBrpPerson(person, relationsListKey, relation.index);
                                                    }}>
                                                    {relation.name}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                        </div>
                    </div>
                </Fragment>
            ) : (
                <EmptyCard
                    title="Basisregistratie personen (BRP) gegevens"
                    description={
                        'Op basis van het BSN kunnen BRP-gegevens worden getoond van de persoon, ' +
                        'inclusief gegevens van de partner, ouders en kinderen.'
                    }
                    type={'card-section'}
                />
            )}
        </Card>
    );
}
