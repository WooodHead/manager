import * as React from 'react';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import * as copy from 'copy-to-clipboard';
import { tail } from 'ramda';

import ShowMore from 'src/components/ShowMore';
import CopyTooltip from 'src/components/CopyTooltip';

type CSSClasses =  'root'
| 'left'
| 'right'
| 'icon'
| 'row'
| 'ip'
| 'ipLink';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  '@keyframes popUp': {
    from: {
      opacity: 0,
      top: -10,
      transform: 'scale(.1)',
    },
    to: {
      opacity: 1,
      top: -40,
      transform: 'scale(1)',
    },
  },
  root: {
    alignItems: 'center',
    marginBottom: theme.spacing.unit / 2,
    width: '100%',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  left: {
    marginLeft: theme.spacing.unit,
  },
  right: {
    marginLeft: theme.spacing.unit,
  },
  icon: {
    '& svg': {
      top: 1,
      width: 14,
      height: 14,
    },
  },
  ip: {
    color: theme.palette.text.primary,
    fontSize: '.9rem',
  },
  ipLink: {
    color: theme.palette.primary.main,
    position: 'relative',
    display: 'inline-block',
    width: 28,
    transition: theme.transitions.create(['color']),
  },
});

interface Props {
  ips: string[];
  copyRight?: boolean;
}

class IPAddress extends React.Component<Props & WithStyles<CSSClasses>> {
  state = {
    copied: false,
  };

  copiedTimeout: number | null = null;

  componentWillUnmount() {
    if (this.copiedTimeout !== null) {
      window.clearTimeout(this.copiedTimeout);
    }
  }

  clickIcon = (ip: string) => {
    this.setState({
      copied: true,
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(ip);
  }

  renderCopyIcon = (ip: string) => {
    const { classes, copyRight } = this.props;

    return (
      <div className={classes.ipLink}>
        <CopyTooltip
          text={ip}
          className={`${classes.icon} ${copyRight ? classes.right : classes.left}`}
        />
      </div>
    );
  }

  renderIP = (ip: string, copyRight?: Boolean, key?: number) => {
    const { classes } = this.props;
    return (
      <div key={key} className={classes.row}>
        <div className={`${classes.ip} ${'ip'}`}>{ip}</div>
        {copyRight && this.renderCopyIcon(ip)}
      </div>
    );
  }

  render() {
    const { classes, ips, copyRight } = this.props;
    const formattedIPS = ips.map(ip => ip.replace('/64', ''));

    return (
      <div className={`dif ${classes.root}`}>
        { this.renderIP(formattedIPS[0], copyRight) }
        {
          formattedIPS.length > 1 && <ShowMore
            items={tail(formattedIPS)}
            render={(ips: string[]) => {
              return ips.map((ip, idx) => this.renderIP(ip.replace('/64', ''), copyRight, idx));
            }} />
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(IPAddress);
