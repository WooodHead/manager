import * as React from 'react';
import AddNewMenuItem from './AddNewMenuItem';
import { shallow, mount } from 'enzyme';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

describe('AddNewMenuItem', () => {
  it('should render without error', () => {
    shallow(
      <LinodeThemeWrapper>
        <AddNewMenuItem
          index={1}
          count={1}
          title="shenanigans"
          body="These be the stories of shennanigans."
          ItemIcon={LinodeIcon}
          onClick={jest.fn()}
        />
      </LinodeThemeWrapper>,
     );
  });

  it('should render a divider if not the last item', () => {
    const result = mount(
      <LinodeThemeWrapper>
        <AddNewMenuItem
          index={1}
          count={1}
          title="shenanigans"
          body="These be the stories of shennanigans."
          ItemIcon={LinodeIcon}
          onClick={jest.fn()}
        />
      </LinodeThemeWrapper>,
    );

    expect(result.find('WithStyles(Divider)')).toHaveLength(1);
  });

  it('should not render a divider if not the last item', () => {
    const result = mount(
      <LinodeThemeWrapper>
        <AddNewMenuItem
          index={0}
          count={1}
          title="shenanigans"
          body="These be the stories of shennanigans."
          ItemIcon={LinodeIcon}
          onClick={jest.fn()}
        />
      </LinodeThemeWrapper>,
    );

    expect(result.find('WithStyles(Divider)')).toHaveLength(0);
  });
});
