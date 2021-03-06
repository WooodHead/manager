const { constants } = require('../../constants');
import { flatten } from 'ramda';
import ListLinodes from '../../pageobjects/list-linodes';

describe('List Linodes - Actions - Reboot Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-linode]');
    });

    describe('Grid View Reboot - Suite', () => {
        let linodes;

        it('should reboot linode on click', () => {
            linodes = ListLinodes.linode;
            linodes[0].$(ListLinodes.rebootButton.selector).click();
            browser.waitForVisible('[data-qa-circle-progress]');
        });

        it('should update status on reboot to booting', () => {
            const currentStatus = linodes[0].$(ListLinodes.status.selector).getAttribute('data-qa-status');
            expect(currentStatus).toBe('rebooting');
        });

        it('should display running status after booted', () => {
            browser.waitUntil(function() {
                return linodes[0].$(ListLinodes.status.selector).getAttribute('data-qa-status') === 'running';
            }, 35000);
        });

        it('should display all grid view elements after reboot', () => {
            ListLinodes.gridElemsDisplay();
        });
    });

    describe('List View Reboot - Suite', () => {
        let linodes, totalLinodes;
        
        beforeAll(() => {
            ListLinodes.switchView('list');
            ListLinodes.tableHead.waitForVisible();

            linodes = ListLinodes.linode;
            totalLinodes = linodes.length;
        });

        it('should reboot linode on click', () => {
            ListLinodes.selectMenuItem(linodes[0], 'Reboot');
            browser.waitForVisible('[data-qa-loading]');
        });

        it('should update status on reboot to booting', () => {
            const currentStatus = linodes[0].$(ListLinodes.status.selector).getAttribute('data-qa-status');
            expect(currentStatus).toBe('rebooting');
        });

        it('should hide action menu', () => {
            // Wait for action menu to no longer be visible
            browser.waitUntil(function() {
                const actionMenuMap = flatten(ListLinodes.linode.map(l => l.$(ListLinodes.linodeActionMenu.selector)));
                return actionMenuMap.length === totalLinodes -1;
            }, 10000);
        });

        it('should display running status after booted', () => {
            browser.waitUntil(function() {
                return linodes[0].$(ListLinodes.status.selector).getAttribute('data-qa-status') === 'running';
            }, 35000);
        });

        it('should display all list view elements after reboot', () => {
            ListLinodes.listElemsDisplay();
        });
    });
});
