import {CommonPage} from './Common.page';

const helpers = require('../Helpers/Selectors');

export class BulkDeleteSubscriptionsConfirmedPage extends CommonPage {
  async getPanelTitle(): Promise<string> {
    $(helpers.panelTitle).catch(() => {
      console.log(`${helpers.panelTitle} not found`);
    });

    return $(helpers.panelTitle).getText();
  }
}