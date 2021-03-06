const { constants } = require('../../constants');

import SearchBar from '../../pageobjects/search.page';
import ListLinodes from '../../pageobjects/list-linodes';
import LinodeDetail from '../../pageobjects/linode-detail.page';
import VolumeDetail from '../../pageobjects/linode-detail-volume.page';

describe('Header - Search - Volumes Suite', () => {
    const testVolume = {
        label: `A${new Date().getTime()}`,
        size: '10',
    }
    let linodeName;

    function navigateToVolumes(label) {
        if (!browser.getUrl().includes(constants.routes.linodes)) {
            browser.url(constants.routes.linodes);
        }

        browser.waitForVisible(`[data-qa-linode="${label}"]`);
        browser.click(`[data-qa-linode="${label}"] [data-qa-label]`);
        LinodeDetail
            .landingElemsDisplay()
            .changeTab('Volumes');
        try {
            VolumeDetail.volumeCellElem.isVisible();
        } catch (err) {
            if (!VolumeDetail.placeholderText.waitForVisible()) {
                throw err;
            }
        }
    }

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        
        ListLinodes.linodesDisplay();
        linodeName = ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).getText();

        ListLinodes.shutdownIfRunning(ListLinodes.linode[0]);
        
        navigateToVolumes(linodeName);
        const volumeCount = !VolumeDetail.placeholderText.isVisible() ? VolumeDetail.volumeCell.length : 0;
        
        VolumeDetail.createVolume(testVolume);

        // Wait until the volume is created before searching for it
        browser.waitUntil(function() {
            return VolumeDetail.volumeCell.length === volumeCount + 1;
        }, 25000);

        testVolume['id'] = VolumeDetail.getVolumeId(testVolume.label);
    });

    it('should display search results for volumes', () => {
        browser.url(constants.routes.linodes);
        SearchBar.assertSearchDisplays();
        SearchBar.executeSearch(testVolume.label);
        browser.waitForVisible('[data-qa-suggestion]', 5000);
    });

    it('should navigate to linode detail volume page', () => {
        browser.click('[data-qa-suggestion]');
        VolumeDetail.volumeCellElem.waitForVisible();
    });

    it('should remove the volume', () => {
        navigateToVolumes(linodeName);
        const volume = $(`[data-qa-volume-cell="${testVolume.id}"`);
        VolumeDetail.removeVolume(volume);
    });

    it('should not display suggestion after removal', () => {
        SearchBar.executeSearch(testVolume.label);
        browser.waitForVisible('[data-qa-suggestion]', 5000, true);
    });
});
