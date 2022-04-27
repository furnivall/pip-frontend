import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../../main/app';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import {PublicationService} from '../../../main/service/publicationService';
import {request as expressRequest} from 'express';

const PAGE_URL = '/family-daily-cause-list?artefactId=abc';
const headingClass = 'govuk-heading-l';
const summaryHeading = 'govuk-details__summary-text';
const summaryText = 'govuk-details__text';
const accordionClass='govuk-accordion__section-button';

const expectedHeader = 'Daily Family Cause List: PRESTON';
const summaryHeadingText = 'Important information';
const accordionHeading = '1, Before: Mr Presiding';
const applicantRespondent = 'Surname, Legal Advisor: Mr Individual Forenames Individual Middlename Individual Surname';
let htmlRes: Document;

const rawData = fs.readFileSync(path.resolve(__dirname, '../mocks/familyDailyCauseList.json'), 'utf-8');
const familyDailyCauseListData = JSON.parse(rawData);
const rawMetaData = fs.readFileSync(path.resolve(__dirname, '../mocks/returnedArtefacts.json'), 'utf-8');
const metaData = JSON.parse(rawMetaData)[0];

sinon.stub(PublicationService.prototype, 'getIndividualPublicationJson').returns(familyDailyCauseListData);
sinon.stub(PublicationService.prototype, 'getIndividualPublicationMetadata').returns(metaData);
sinon.stub(expressRequest, 'isAuthenticated').returns(true);

describe('Family Daily Cause List page', () => {
  beforeAll(async () => {
    await request(app).get(PAGE_URL).then(res => {
      htmlRes = new DOMParser().parseFromString(res.text, 'text/html');
    });
  });

  it('should display header',  () => {
    const header = htmlRes.getElementsByClassName(headingClass);
    expect(header[0].innerHTML).contains(expectedHeader, 'Could not find the header');
  });

  it('should display summary',  () => {
    const summary = htmlRes.getElementsByClassName(summaryHeading);
    expect(summary[0].innerHTML).contains(summaryHeadingText, 'Could not find the display summary heading');
  });

  it('should display court name summary paragraph',  () => {
    const summary = htmlRes.getElementsByClassName(summaryText);
    expect(summary[0].innerHTML).contains('PRESTON', 'Could not find the court name in summary text');
  });

  it('should display court email summary paragraph',  () => {
    const summary = htmlRes.getElementsByClassName(summaryText);
    expect(summary[0].innerHTML).contains('court1@moj.gov.u', 'Could not find the court name in summary text');
  });

  it('should display court contact number summary paragraph',  () => {
    const summary = htmlRes.getElementsByClassName(summaryText);
    expect(summary[0].innerHTML).contains('01772 844700', 'Could not find the court name in summary text');
  });

  it('should display accordion heading',  () => {
    const accordion = htmlRes.getElementsByClassName(accordionClass);
    expect(accordion[0].innerHTML).contains(accordionHeading, 'Could not find the accordion heading');
  });

  it('should display case time',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[0].innerHTML).contains('09:00');
  });

  it('should display Case Id',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[1].innerHTML).contains('12345678');
  });

  it('should display Case name',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[2].innerHTML).contains('A1 Vs B1');
  });

  it('should display Case type',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[3].innerHTML).contains('type');
  });

  it('should display Hearing Type',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[4].innerHTML).contains('FMPO');
  });

  it('should display Hearing platform',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[5].innerHTML).contains('testSittingChannel');
  });

  it('should display Hearing duration',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[6].innerHTML).contains('1 hour 5 mins');
  });

  it('should display Applicant/petitioner',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[7].innerHTML).contains(applicantRespondent);
  });

  it('should display respondent',  () => {
    const cell = htmlRes.getElementsByClassName('govuk-table__cell');
    expect(cell[8].innerHTML).contains(applicantRespondent);
  });
});