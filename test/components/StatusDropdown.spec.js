import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import StatusDropdown from '../../src/components/StatusDropdown';

import { api, freshState } from '@/data';

const { linodes } = api;

describe('components/StatusDropdown', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders correct options for offline Linodes', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1236]} dispatch={() => {}} />
    );

    expect(dropdown.find('span.linode-status').text()).to.equal('Offline');

    dropdown.find('.dropdown-toggle').simulate('click');

    expect(dropdown.find('.dropdown-item').length).to.equal(1);
    expect(dropdown.find('.dropdown-item').at(0).text()).
      to.contain('Power on');
  });

  it('renders correct options for online Linodes', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    expect(dropdown.find('span.linode-status').text()).to.equal('Running');

    dropdown.find('.dropdown-toggle').simulate('click');

    expect(dropdown.find('.dropdown-item').length).to.equal(2);
    expect(dropdown.find('.dropdown-item').at(0).text()).to.contain(' Reboot');
    expect(dropdown.find('.dropdown-item').at(1).text()).
      to.contain(' Power off');
  });

  it('has a clickable dropdown', () => {
    const dispatch = sinon.spy();
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1235]} jdispatch={dispatch} />
    );

    dropdown.find('.dropdown-toggle').simulate('click');
    dropdown.find('.dropdown-item').at(0).simulate('click');
    console.log(dispatch.getCall(0).args);
    expect(dispatch.calledWith({
      type: HIDE_MODAL, // ??
    })).to.equal(true);
  });

/*
  it('closes on second click', () => {
    const noAction = () => {};
    const dropdown = mount(<StatusDropdown
      elements={[
        { action: noAction, name: '' },
        { action: noAction, name: '' },
      ]}
    />);

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(1);
    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(0);
  });

  it('closes on blur', () => {
    const noAction = () => {};
    const dropdown = mount(<StatusDropdown
      elements={[
        { action: noAction, name: '' },
        { action: noAction, name: '' },
      ]}
    />);

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(1);
    dropdown.find('.dropdown-toggle').simulate('blur');
    expect(dropdown.find('.btn-group.open').length).to.equal(0);
  });
*/
});
