import { request as expressRequest } from 'express';
import sinon from 'sinon';
import request from 'supertest';
import { app } from '../../../main/app';
import { PublicationService } from '../../../main/service/publicationService';
import { expect } from 'chai';
import { CourtService } from '../../../main/service/courtService';

const PAGE_URL = '/remove-list-confirmation?artefact=18dec6ee-3a30-47bb-9fb3-6a343d6b9efb';

const mockArtefact = {
  listType: 'CIVIL_DAILY_CAUSE_LIST',
  listTypeName: 'Civil Daily Cause List',
  contentDate: '2022-03-24T07:36:35',
  courtId: '5',
  artefactId: 'valid-artefact',
};
const keyValues = ['Court or tribunal name', 'Publication', 'Publication date'];
const content = ['Mock Court', 'Civil Daily Cause List', '24 March 2022'];
sinon.stub(PublicationService.prototype, 'getIndividualPublicationMetadata').resolves(mockArtefact);
sinon.stub(CourtService.prototype, 'getCourtById').resolves({courtId: '5', name: 'Mock Court'});
sinon.stub(expressRequest, 'isAuthenticated').returns(true);
sinon.stub(PublicationService.prototype, 'removePublication').withArgs('foo').resolves(false);

let htmlRes: Document;

describe('Remove List Confirmation Page', () => {
  describe('without error', () => {
    beforeAll(async () => {
      await request(app).get(PAGE_URL).then(res => {
        htmlRes = new DOMParser().parseFromString(res.text, 'text/html');
      });
    });

    it('should have correct page title', () => {
      const pageTitle = htmlRes.title;
      expect(pageTitle).contains('Are you sure you want to remove this publication?', 'Page title does not match header');
    });

    it('should display header', () => {
      const header = htmlRes.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).contains('Are you sure you want to remove this publication?', 'Could not find correct value in header');
    });

    it('should display warning message', () => {
      const warning = htmlRes.getElementsByClassName('govuk-warning-text__text')[0];
      expect(warning.innerHTML).contains('You are about to remove the following publication:', 'Could not find correct warning message');
    });

    it('should display summary table', () => {
      const summaryKeys = htmlRes.getElementsByClassName('govuk-summary-list__key');
      const summaryValues = htmlRes.getElementsByClassName('govuk-summary-list__value');
      for(let i = 0; i < summaryKeys.length; i++) {
        expect(summaryKeys[i].innerHTML).contains(keyValues[i], 'Could not find valid summary key');
        expect(summaryValues[i].innerHTML).contains(content[i], 'Could not find valid summary value');
      }
    });

    it('should display 2 radio options with valid values', () => {
      const radios = htmlRes.getElementsByClassName('govuk-radios__input');
      expect(radios.length).equals(2, 'Could not find all radio buttons');
      expect(radios[0].getAttribute('value')).equals('yes', 'Could not find valid radio value');
      expect(radios[1].getAttribute('value')).equals('no', 'Could not find valid radio value');
    });

    it('should display continue button',  () => {
      const buttons = htmlRes.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).contains('Continue', 'Could not find button');
    });
  });

  describe('with error', () => {
    beforeAll(async () => {
      await request(app).post(PAGE_URL).send({courtId: '5', artefactId: 'foo'}).then(res => {
        htmlRes = new DOMParser().parseFromString(res.text, 'text/html');
      });
    });

    it('should display error summary', () => {
      const dialog = htmlRes.getElementsByClassName('govuk-error-summary');
      expect(dialog[0].getElementsByClassName('govuk-error-summary__title')[0].innerHTML)
        .contains('There is a problem', 'Could not find error dialog title');
    });

    it('should display error messages in the summary', () => {
      const list = htmlRes.getElementsByClassName(' govuk-error-summary__list')[0];
      const listItems = list.getElementsByTagName('a');
      expect(listItems[0].innerHTML).contains('Please select an option', 'Could not find error');
    });
  });
});