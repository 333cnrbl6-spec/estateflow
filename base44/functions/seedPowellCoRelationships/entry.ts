/**
 * seedPowellCoRelationships
 *
 * Seeds all Powell & Co group companies as CompaniesHouseProfile records
 * and maps Sean Powell (and Tania Powell) as directors across all of them
 * via OwnershipRelationship records.
 *
 * This is the core USP demo data — run once manually.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SEAN_POWELL_ID = 'sean_powell';
const TANIA_POWELL_ID = 'tania_powell';

const POWELL_COMPANIES = [
  { company_number: '05826387', company_name: 'Powell & Co Property (Brighton) Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: '324 Queens Road, Brighton, BN1 3WB', incorporated: '1997-03-07', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2001-06-18' }, { id: TANIA_POWELL_ID, name: 'Tania Powell', appointed_on: '2002-01-16' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent, right-to-appoint-and-remove-directors' }] },
  { company_number: '10764568', company_name: 'Powell & Co Property Freeholds Limited', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'PO Box 79039, Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2017-04-20', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2017-04-20' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent, right-to-appoint-and-remove-directors' }] },
  { company_number: '09976213', company_name: 'Powell & Co Property (London) Ltd', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'PO Box 79039, Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2015-10-23', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2015-10-23' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent, right-to-appoint-and-remove-directors' }] },
  { company_number: '07692699', company_name: 'Brighton Property Trading Limited', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2011-02-18', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2011-02-18' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '10994060', company_name: '4 Quarry Terrace Limited', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2017-09-11', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2017-09-11' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '08132494', company_name: 'PowellandCo RTM Company Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2013-03-15', directors: [{ id: TANIA_POWELL_ID, name: 'Tania Powell', appointed_on: '2013-03-15' }], psc: [] },
  { company_number: '05256027', company_name: 'JD Property (Blackpool) Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Sean Powell, Ivebury Court, 325 Latimer Road, London, W10 6RA', incorporated: '1996-07-22', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '1996-07-22' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '10653744', company_name: 'North Avenue Limited', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2017-01-09', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2017-01-09' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '10398602', company_name: '24 Charles Road Limited', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2016-10-03', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2016-10-03' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '12852077', company_name: 'London Sailors Ltd', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2020-02-14', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2020-02-14' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '13433757', company_name: 'Harold Road Ltd', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2021-04-09', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2021-04-09' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '16496661', company_name: 'Harehills Land Ltd', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'C/O Coots & Co, Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2023-07-21', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2023-07-21' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '13379255', company_name: '11 Rancorn Rd Freehold Ltd', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Coots And Co, Cumberland Basin Prince Albert Road, London, NW1 7SS', incorporated: '2021-02-01', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2021-02-01' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '13075231', company_name: '22 Meteor Road Freehold Ltd', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2020-09-18', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2020-09-18' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '13044670', company_name: '105 Courthill Road Freehold Limited', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2020-08-07', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2020-08-07' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent' }] },
  { company_number: '06597661', company_name: 'Admiral Point RTM Company Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'First Floor 195-199, Ansdell Road, Blackpool, Lancashire, FY1 6PE', incorporated: '2008-03-12', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2008-03-12' }], psc: [] },
  { company_number: '04629390', company_name: 'Brookshaw Court Management Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2002-08-20', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2002-08-20' }], psc: [] },
  { company_number: '01627345', company_name: 'Broken Banks Management Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '1985-01-14', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2010-05-03' }], psc: [] },
  { company_number: '05708178', company_name: '7 North Avenue RTM Company Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2005-12-02', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2005-12-02' }], psc: [] },
  { company_number: '05853898', company_name: '128 Grosvenor Place RTM Company Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2006-04-07', directors: [{ id: TANIA_POWELL_ID, name: 'Tania Powell', appointed_on: '2006-04-07' }], psc: [] },
  { company_number: '06583386', company_name: '23 Belgrave Road RTM Company Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2008-06-13', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2008-06-13' }], psc: [] },
  { company_number: '01258091', company_name: 'Majestic Court Management Company Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Coots And Co Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '1976-10-29', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2015-06-18' }], psc: [] },
  { company_number: '03537063', company_name: 'Enfield Island Village Phase 1 Management & Tenants Association Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '1998-02-19', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2012-07-20' }], psc: [] },
  { company_number: '13061798', company_name: '11 Rancorn Road RTM Company Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Coots And Co, Prince Albert Road, London, NW1 7SS', incorporated: '2020-07-17', directors: [{ id: TANIA_POWELL_ID, name: 'Tania Powell', appointed_on: '2020-07-17' }], psc: [] },
  { company_number: '15496575', company_name: '46 Surrey Rd RTM Company Limited', status: 'dissolved', type: 'ltd', sic_codes: ['68320'], address: 'Flat 5, 7 Cleveland Gardens, Coots And Co, Cumberland Basin, London, W2 6HA', incorporated: '2024-03-08', directors: [], psc: [] },
  { company_number: '05826347', company_name: 'Powell & Co Property Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '1997-03-06', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2001-06-18' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent, right-to-appoint-and-remove-directors' }] },
  { company_number: '13992328', company_name: 'Powell and Co (Blackpool) Ltd', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2021-11-12', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2021-11-12' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent, right-to-appoint-and-remove-directors' }] },
  { company_number: '14346745', company_name: 'Powell and Co Associates Ltd', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2022-05-06', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2022-05-06' }, { id: TANIA_POWELL_ID, name: 'Tania Powell', appointed_on: '2022-05-06' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-50-to-75-percent, voting-rights-50-to-75-percent' }, { name: 'Tania Powell', nature_of_control: 'ownership-of-shares-25-to-50-percent, voting-rights-25-to-50-percent' }] },
  { company_number: '10833646', company_name: 'Powell & Co Assets Limited', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'C/O Coots And Co, Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2017-06-23', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2017-06-23' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent, right-to-appoint-and-remove-directors' }] },
  { company_number: '06030136', company_name: 'Powell & Co Management Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2007-12-14', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2007-12-14' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-75-to-100-percent, voting-rights-75-to-100-percent, right-to-appoint-and-remove-directors' }] },
  { company_number: '13696161', company_name: 'Powell and Carvalho International Ltd', status: 'active', type: 'ltd', sic_codes: ['68100'], address: 'Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2021-08-27', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2021-08-27' }], psc: [{ name: 'Sean Powell', nature_of_control: 'ownership-of-shares-50-to-75-percent, voting-rights-50-to-75-percent' }] },
  { company_number: '06173925', company_name: 'Carvalho Concept Limited', status: 'active', type: 'ltd', sic_codes: ['68320'], address: 'Coots And Co, Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporated: '2007-04-20', directors: [{ id: SEAN_POWELL_ID, name: 'Sean Powell', appointed_on: '2007-04-20' }], psc: [] },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let profilesCreated = 0;
    let profilesSkipped = 0;
    let relationshipsCreated = 0;

    for (const co of POWELL_COMPANIES) {
      // Upsert CompaniesHouseProfile
      const existing = await base44.asServiceRole.entities.CompaniesHouseProfile.filter({ company_number: co.company_number });

      const profileData = {
        company_number: co.company_number,
        company_name: co.company_name,
        company_status: co.status,
        company_type: co.type,
        incorporation_date: co.incorporated,
        registered_address: co.address,
        sic_codes: co.sic_codes,
        directors: co.directors.map(d => ({ name: d.name, role: 'director', appointed_on: d.appointed_on, resigned_on: '' })),
        persons_with_significant_control: co.psc,
        has_active_mortgages: false,
        mortgages_count: 0,
        critical_alerts: [],
        last_synced: new Date().toISOString(),
        next_sync_due: new Date(Date.now() + 7 * 86400000).toISOString(),
      };

      let profile;
      if (existing.length > 0) {
        profile = await base44.asServiceRole.entities.CompaniesHouseProfile.update(existing[0].id, profileData);
        profilesSkipped++;
      } else {
        profile = await base44.asServiceRole.entities.CompaniesHouseProfile.create(profileData);
        profilesCreated++;
      }

      // Create director relationships
      for (const dir of co.directors) {
        const relExists = await base44.asServiceRole.entities.OwnershipRelationship.filter({
          from_entity_id: dir.id,
          to_entity_id: co.company_number,
          relationship_type: 'director_of',
        });
        if (relExists.length === 0) {
          await base44.asServiceRole.entities.OwnershipRelationship.create({
            from_entity_type: 'person',
            from_entity_id: dir.id,
            from_label: dir.name,
            to_entity_type: 'company',
            to_entity_id: co.company_number,
            to_label: co.company_name,
            relationship_type: 'director_of',
            relationship_label: 'Director of',
            verified: true,
            source: 'companies_house',
            conflict_of_interest: false,
          });
          relationshipsCreated++;
        }
      }

      // Create PSC relationships
      for (const p of co.psc) {
        const pscId = p.name.toLowerCase().replace(/\s+/g, '_');
        const relExists = await base44.asServiceRole.entities.OwnershipRelationship.filter({
          from_entity_id: pscId,
          to_entity_id: co.company_number,
          relationship_type: 'psc_of',
        });
        if (relExists.length === 0) {
          await base44.asServiceRole.entities.OwnershipRelationship.create({
            from_entity_type: 'person',
            from_entity_id: pscId,
            from_label: p.name,
            to_entity_type: 'company',
            to_entity_id: co.company_number,
            to_label: co.company_name,
            relationship_type: 'psc_of',
            relationship_label: 'PSC of',
            notes: p.nature_of_control,
            verified: true,
            source: 'companies_house',
            conflict_of_interest: false,
          });
          relationshipsCreated++;
        }
      }
    }

    return Response.json({
      success: true,
      profiles_created: profilesCreated,
      profiles_updated: profilesSkipped,
      relationships_created: relationshipsCreated,
      total_companies: POWELL_COMPANIES.length,
      sean_powell_companies: POWELL_COMPANIES.filter(c => c.directors.some(d => d.id === SEAN_POWELL_ID)).length,
      tania_powell_companies: POWELL_COMPANIES.filter(c => c.directors.some(d => d.id === TANIA_POWELL_ID)).length,
    });
  } catch (err) {
    console.error('[seedPowellCoRelationships]', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});