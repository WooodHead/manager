import Page from './page';

export const dialogMap = {
    title: '[data-qa-dialog-title]',
    content: '[data-qa-dialog-content]',
    close: '[data-qa-close-dialog]',
    cancel: '[data-qa-button-cancel]',
    confirm: '[data-qa-button-confirm]',
}

export class OauthCreateDrawer {
    get title() { return $('[data-qa-drawer-title]'); }
    get label() { return $('[data-qa-add-label] input'); }
    get submit() { return $('[data-qa-submit]'); }
    get cancel() { return $('[data-qa-cancel]'); }
    get callbackUrl() { return $('[data-qa-callback] input'); }
    get public() { return $('[data-qa-public]'); }

    updateLabel(updateMsg) {
        const labelField = this.label;
        // Hack needed to edit a label
        browser.waitUntil(function() {
            try {
                labelField.clearElement();
                labelField.setValue(updateMsg);
                return labelField.getValue() === updateMsg;
            } catch (err) {
                return false;
            }
        }, 15000);
    }
}

export class TokenCreateDrawer {
    get title() { return $('[data-qa-drawer-title]'); }
    get accessColumn() { return $$('[data-qa-perm-access]'); }
    get noneColumn() { return $('[data-qa-perm-none]'); }
    get readColumn() { return $('[data-qa-perm-read]'); }
    get rwColumn() { return $('[data-qa-perm-rw]'); }
    get label() { return $('[data-qa-add-label] input'); }

    get account() { return $('[data-qa-row="Account"]'); }
    get domain() { return $('[data-qa-row="Domains"]'); }
    get events() { return $('[data-qa-row="Events"]'); }
    get images() { return $('[data-qa-row="Images"]'); }
    get ips() { return $('[data-qa-row="IPs"]'); }
    get linodes() { return $('[data-qa-row="IPs"]'); }
    get longview() { return $('[data-qa-row="Longview"]')}
    get nodebalancers() { return $('[data-qa-row="NodeBalancers"]'); }
    get stackscripts() { return $('[data-qa-row="StackScripts"]'); }
    get volumes() { return $('[data-qa-row="Volumes"]'); }

    // get expiry() { return $('[data-qa-token-expiry]'); }
    get nonePermission() { return $('[data-qa-perm-none-radio]'); }
    get readPermission() { return $('[data-qa-perm-read-radio]'); }
    get rwPermission() { return $('[data-qa-perm-rw-radio]'); }

    get submit() { return $('[data-qa-submit]'); }
    get cancel() { return $('[data-qa-cancel]'); }
    get closeDialog() { return $('[data-qa-close-dialog]'); }


    baseElemsDisplay() {
        expect(this.noneColumn.isVisible()).toBe(true); 
        expect(this.readColumn.isVisible()).toBe(true);
        expect(this.rwColumn.isVisible()).toBe(true); 
        expect(this.label.isVisible()).toBe(true); 

        expect(this.account.isVisible()).toBe(true);
        expect(this.domain.isVisible()).toBe(true);
        expect(this.events.isVisible()).toBe(true);
        expect(this.images.isVisible()).toBe(true);
        expect(this.ips.isVisible()).toBe(true);
        expect(this.linodes.isVisible()).toBe(true);
        expect(this.longview.isVisible()).toBe(true);
        expect(this.nodebalancers.isVisible()).toBe(true);
        expect(this.stackscripts.isVisible()).toBe(true);
        expect(this.volumes.isVisible()).toBe(true);

        // expect(this.expiry.isVisible()).toBe(true);
        expect(this.nonePermission.isVisible()).toBe(true);
        expect(this.readPermission.isVisible()).toBe(true);
        expect(this.rwPermission.isVisible()).toBe(true);
        expect(this.submit.isVisible()).toBe(true);
        expect(this.cancel.isVisible()).toBe(true);
    }

    labelTimestamp(time) {
        this.label.setValue(time);
        this.accessColumn.forEach(col => expect(col.isVisible()).toBe(true));
        // expect(this.expiry.isVisible()).toBe(true);
    }

    setPermission(row, permission) {
        const elem = row.$(permission.selector);
        elem.click();
        expect(elem.getAttribute('class').includes('checked')).toBe(true);
    }

}

export class Profile extends Page {
    get profileHeader() { return $('[data-qa-profile-header]'); }
    get apiTokensTab() { return $('[data-qa-tab="API Tokens"]'); }
    get oauthClientsTab() { return $('[data-qa-tab="OAuth Clients"]'); }
    get tableHeader() { return $$('[data-qa-table]'); }
    get tableHead() { return $$('[data-qa-table-head]'); }
    get tableRow() { return $$('[data-qa-table-row]'); }

    get tokenLabel() { return $$('[data-qa-token-label]'); }
    get tokenType() { return $$('[data-qa-token-type]'); }
    get tokenCreated() { return $('[data-qa-token-created]') }
    get tokenExpires() { return $('[data-qa-token-expiry]'); }
    get tokenActionMenu() { return $('[data-qa-action-menu]'); }
    get tokenCreate() { return $('[data-qa-icon-text-link="Add a Personal Access Token"]'); }

    get oauthLabel() { return $('[data-qa-oauth-label]'); }
    get oauthAccess() { return $('[data-qa-oauth-access]'); }
    get oauthId() { return $('[data-qa-oauth-id]'); }
    get oauthCallback() { return $('[data-qa-oauth-callback]'); }
    get oauthActionMenu() { return $('[data-qa-action-menu]'); }
    get oauthCreate() { return $('[data-qa-icon-text-link="Create an OAuth Client"]'); }

    tokenBaseElems() {
        browser.waitForVisible('[data-qa-profile-header]');
        expect(this.profileHeader.isVisible()).toBe(true);
        expect(this.apiTokensTab.isVisible()).toBe(true);
        expect(this.tokenCreate.waitForVisible()).toBe(true);
        expect(this.tableHeader.length).toBe(2);
        expect(this.tableHead.length).toBe(2);
        this.tableHead.forEach(t => expect(t.$$('th').length).toBe(5));
    }

    oauthBaseElems() {
        browser.waitForVisible('[data-qa-profile-header]');
        const oauthSelected = browser.getAttribute('[data-qa-tab="OAuth Clients"]', 'aria-selected').includes('true');
        expect(oauthSelected).toBe(true);

        browser.waitForVisible('[data-qa-oauth-label]');
        expect(this.oauthLabel.isVisible()).toBe(true);
        expect(this.oauthAccess.isVisible()).toBe(true);
        expect(this.oauthId.isVisible()).toBe(true);
        expect(this.oauthActionMenu.isVisible()).toBe(true);
        expect(this.oauthCreate.isVisible()).toBe(true);
    }

    create(type) {
        if (type === 'oauth') {
            this.oauthCreate.click();
        }
        if (type === 'token') {
            this.tokenCreate.click();
        }
        browser.waitForVisible('[data-qa-add-label]');
        browser.waitForText('[data-qa-drawer-title]');
    }
    
    selectActionMenu(row, item) {
        browser.click(`[data-qa-table-row="${row}"] [data-qa-action-menu]`);
        browser.waitForVisible('[data-qa-action-menu-item]');
        browser.click(`[data-qa-action-menu-item="${item}"]`);
    }

    delete(type, row) {
        if (type === 'oauth') {
            this.selectActionMenu(row, 'Delete');
            browser.waitForVisible(dialogMap.title);

            const deleteButton = $(dialogMap.confirm);
            deleteButton.click();

            browser.waitForVisible(`[data-qa-table-row="${row}"]`, 10000, true);
        }

        if (type == 'token') {

        }
    }
}
