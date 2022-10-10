import sinon from 'sinon';
import fs from 'fs';
import path from 'path';
import IacDailyListController from '../../../main/controllers/IacDailyListController';
import {PublicationService} from '../../../main/service/publicationService';
import {DataManipulationService} from '../../../main/service/dataManipulationService';
import {Response} from 'express';
import {mockRequest} from '../mocks/mockRequest';
import moment from 'moment';

const rawData = fs.readFileSync(path.resolve(__dirname, '../mocks/iacDailyList.json'), 'utf-8');
const listData = JSON.parse(rawData);

const rawMetaData = fs.readFileSync(path.resolve(__dirname, '../mocks/returnedArtefacts.json'), 'utf-8');
const metaData = JSON.parse(rawMetaData)[0];

const iacDailyListController = new IacDailyListController();

const iacDailyListJsonStub = sinon.stub(PublicationService.prototype, 'getIndividualPublicationJson');
const iacDailyListMetaDataStub = sinon.stub(PublicationService.prototype, 'getIndividualPublicationMetadata');
sinon.stub(DataManipulationService.prototype, 'manipulateIacDailyListData').returns(listData);

const artefactId = 'abc';

iacDailyListJsonStub.withArgs(artefactId).resolves(listData);
iacDailyListJsonStub.withArgs('').resolves([]);

iacDailyListMetaDataStub.withArgs(artefactId).resolves(metaData);
iacDailyListMetaDataStub.withArgs('').resolves([]);

const i18n = {
  'iac-daily-list': {},
};

describe('IAC Daily List Controller', () => {

  const response = { render: () => {return '';}} as unknown as Response;
  const request = mockRequest(i18n);
  request.path = '/iac-daily-list';

  afterEach(() => {
    sinon.restore();
  });

  it('should render the IAC daily list page', async () => {
    request.query = {artefactId: artefactId};
    request.user = {piUserId: '1'};

    const responseMock = sinon.mock(response);
    const expectedData = {
      ...i18n['iac-daily-list'],
      listData,
      contentDate: moment(Date.parse(metaData['contentDate'])).format('DD MMMM YYYY'),
      publishedDate: '31 August 2022',
      publishedTime: '11am',
      provenance: 'prov1',
      bill: false,
    };

    responseMock.expects('render').once().withArgs('iac-daily-list', expectedData);

    await iacDailyListController.get(request, response);
    return responseMock.verify();
  });

  it('should render error page if query param is empty', async () => {
    const request = mockRequest(i18n);
    request.query = {};
    request.user = {piUserId: '123'};

    const responseMock = sinon.mock(response);

    responseMock.expects('render').once().withArgs('error', request.i18n.getDataByLanguage(request.lng).error);

    await iacDailyListController.get(request, response);
    return responseMock.verify();
  });
});