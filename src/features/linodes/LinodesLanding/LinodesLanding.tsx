import * as React from 'react';

import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Axios, { AxiosResponse } from 'axios';
import * as moment from 'moment';
import {
  allPass,
  clone,
  compose,
  filter,
  gte,
  has,
  ifElse,
  isEmpty,
  pathEq,
  pathOr,
  prop,
  propEq,
  uniqBy,
} from 'ramda';

import { Observable, Subscription } from 'rxjs/Rx';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui/styles';
import Hidden from 'material-ui/Hidden';

import Grid from 'src/components/Grid';
import { events$ } from 'src/events';
import notifications$ from 'src/notifications';
import { API_ROOT } from 'src/constants';

import { newLinodeEvents } from 'src/features/linodes/events';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import ErrorState from 'src/components/ErrorState';
import PaginationFooter from 'src/components/PaginationFooter';
import LinodeConfigSelectionDrawer, {
  LinodeConfigSelectionDrawerCallback,
} from 'src/features/LinodeConfigSelectionDrawer';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import ProductNotification from 'src/components/ProductNotification';

import LinodesListView from './LinodesListView';
import LinodesGridView from './LinodesGridView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ToggleBox from './ToggleBox';

import './linodes.css';
import { Typography, WithStyles } from 'material-ui';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginbottom: theme.spacing.unit * 2,
  },
});

interface Props { }

interface ConnectedProps {
  types: Linode.LinodeType[];
}

interface PreloadedProps {
  linodes: PromiseLoaderResponse<Linode.ResourcePage<Linode.EnhancedLinode>>;
  images: PromiseLoaderResponse<Linode.ResourcePage<Linode.Image>>;
}

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: LinodeConfigSelectionDrawerCallback;
}

interface State {
  linodes: Linode.EnhancedLinode[];
  notifications?: Linode.Notification[];
  page: number;
  pages: number;
  results: number;
  pageSize: number;
  configDrawer: ConfigDrawerState;
}

const mapStateToProps = (state: Linode.AppState) => ({
  types: pathOr({}, ['resources', 'types', 'data', 'data'], state),
});

const preloaded = PromiseLoader<Props>({
  linodes: () => Axios.get(`${API_ROOT}/linode/instances`, { params: { page_size: 25 } })
    .then(response => response.data),

  images: () => Axios.get(`${API_ROOT}/images`)
    .then(response => response.data),
});

type CombinedProps = Props
  & ConnectedProps
  & PreloadedProps
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>
  & SetDocsProps;

export class ListLinodes extends React.Component<CombinedProps, State> {
  eventsSub: Subscription;
  notificationSub: Subscription;
  notificationsSubscription: Subscription;
  mounted: boolean = false;

  state: State = {
    linodes: pathOr([], ['response', 'data'], this.props.linodes),
    page: pathOr(-1, ['response', 'page'], this.props.linodes),
    pages: pathOr(-1, ['response', 'pages'], this.props.linodes),
    results: pathOr(0, ['response', 'results'], this.props.linodes),
    configDrawer: {
      open: false,
      configs: [],
      error: undefined,
      selected: undefined,
      action: (id: number) => null,
    },
    pageSize: 25,
  };

  static docs = [
    {
      title: 'Getting Started with Linode',
      src: 'https://linode.com/docs/getting-started/',
      body: `Thank you for choosing Linode as your cloud hosting provider! This guide will help you
      sign up for an account, set up a Linux distribution, boot your Linode, and perform some basic
      system administr...`,
    },
    {
      title: 'How to Secure your Server',
      src: 'https://linode.com/docs/security/securing-your-server/',
      body: `Keeping your software up to date is the single biggest security precaution you can
      take for any operating system. Software updates range from critical vulnerability patches to
      minor bug fixes, and...`,
    },

  ];

  componentDidMount() {
    this.mounted = true;
    const mountTime = moment().subtract(5, 'seconds');

    this.eventsSub = events$
      .filter(newLinodeEvents(mountTime))
      .filter(e => !e._initial)
      .subscribe((linodeEvent) => {
        Axios.get(`${API_ROOT}/linode/instances/${(linodeEvent.entity as Linode.Entity).id}`)
          .then(response => response.data)
          .then((linode) => {
            if (!this.mounted) { return; }

            return this.setState((prevState) => {
              const targetIndex = prevState.linodes.findIndex(
                _linode => _linode.id === (linodeEvent.entity as Linode.Entity).id);
              const updatedLinodes = clone(prevState.linodes);
              updatedLinodes[targetIndex] = linode;
              updatedLinodes[targetIndex].recentEvent = linodeEvent;
              return { linodes: updatedLinodes };
            });
          });
      });

    this.notificationSub = Observable
      .combineLatest(
        notifications$
          .map(notifications => notifications.filter(pathEq(['entity', 'type'], 'linode'))),
        Observable.of(this.props.linodes),
    )
      .map(([notifications, linodes]) => {
        /** Imperative and gross a/f. Ill fix it. */
        linodes.response.data = linodes.response.data.map((linode) => {
          const notification = notifications.find(pathEq(['entity', 'id'], linode.id));
          if (notification) {
            linode.notification = notification.message;
            return linode;
          }

          return linode;
        });

        return linodes;
      })
      .subscribe((response) => {
        if (!this.mounted) { return; }

        return this.setState({ linodes: response.response.data });
      });

    this.notificationsSubscription = notifications$
      .map(compose(
        uniqBy(prop('type')),
        filter(allPass([
          pathEq(['entity', 'type'], 'linode'),
          has('message'),
        ])),
      ))
      .subscribe((notifications: Linode.Notification[]) =>
        this.setState({ notifications }));
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventsSub.unsubscribe();
    this.notificationSub.unsubscribe();
  }

  openConfigDrawer = (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => {
    this.setState({
      configDrawer: {
        open: true,
        configs,
        selected: configs[0].id,
        action,
      },
    });
  }

  closeConfigDrawer = () => {
    this.setState({
      configDrawer: {
        open: false,
        configs: [],
        error: undefined,
        selected: undefined,
        action: (id: number) => null,
      },
    });
  }

  changeViewStyle = (style: string) => {
    const { history } = this.props;
    history.push(`#${style}`);
  }

  renderListView = (
    linodes: Linode.Linode[],
    images: Linode.Image[],
    types: Linode.LinodeType[],
  ) => {
    return (
      <LinodesListView
        linodes={linodes}
        images={images}
        types={types}
        openConfigDrawer={this.openConfigDrawer}
      />
    );
  }

  renderGridView = (
    linodes: Linode.Linode[],
    images: Linode.Image[],
    types: Linode.LinodeType[],
  ) => {
    return (
      <LinodesGridView
        linodes={linodes}
        images={images}
        types={types}
        openConfigDrawer={this.openConfigDrawer}
      />
    );
  }

  getLinodes = (page = 1, pageSize = 25) => {
    const lastPage = Math.ceil(this.state.results / pageSize);

    Axios.get(`${API_ROOT}/linode/instances`, {
      params: {
        page: Math.min(lastPage, page),
        page_size: pageSize,
      },
    })
      .then((response: AxiosResponse<Linode.ResourcePage<Linode.Linode>>) => response.data)
      .then((response) => {
        if (!this.mounted) { return; }

        this.setState(prevResults => ({
          ...prevResults,
          linodes: pathOr([], ['data'], response),
          page: pathOr(0, ['page'], response),
          pages: pathOr(0, ['pages'], response),
          results: pathOr(0, ['results'], response),
          pageSize,
        }));
      });
  }

  handlePageSelection = (page: number) => {
    this.getLinodes(Math.min(page), this.state.pageSize);
  }

  handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.getLinodes(this.state.page, parseInt(event.target.value, 0));
  }

  selectConfig = (id: number) => {
    this.setState(prevState => ({
      configDrawer: {
        ...prevState.configDrawer,
        selected: id,
      },
    }));
  }

  submitConfigChoice = () => {
    const { action, selected } = this.state.configDrawer;
    if (selected && action) {
      action(selected);
      this.closeConfigDrawer();
    }
  }

  render() {
    const { types, location: { hash } } = this.props;
    const { linodes, configDrawer } = this.state;
    const images = pathOr([], ['response', 'data'], this.props.images);

    if (linodes.length === 0) {
      return <ListLinodesEmptyState />;
    }

    if (this.props.linodes.error) {
      return (
        <ErrorState errorText="Error loading data" />
      );
    }

    if (this.props.images.error) {
      return (
        <ErrorState errorText="Error loading data" />
      );
    }


    const displayGrid: 'grid' | 'list' = getDisplayFormat({ hash, length: linodes.length });

    return (
      <Grid container>
        <Grid item xs={12}>
          <Typography
            variant="headline"
            className={this.props.classes.title}
            data-qa-title
            >
            Linodes
          </Typography>
          <Hidden smDown>
            <ToggleBox
              handleClick={this.changeViewStyle}
              status={displayGrid}
            />
          </Hidden>
        </Grid>
        <Grid item xs={12}>
          {
            (this.state.notifications || []).map(n =>
              <ProductNotification key={n.type} severity={n.severity} text={n.message} />)
          }
          <Hidden mdUp>
            {this.renderGridView(linodes, images, types)}
          </Hidden>
          <Hidden smDown>
            {displayGrid === 'grid'
              ? this.renderGridView(linodes, images, types)
              : this.renderListView(linodes, images, types)
            }
          </Hidden>
        </Grid>
        <Grid item xs={12}>
          {
            this.state.results > 25 &&
            <PaginationFooter
              handlePageChange={this.handlePageSelection}
              handleSizeChange={this.handlePageSizeChange}
              pageSize={this.state.pageSize}
              pages={this.state.pages}
              page={this.state.page}
            />
          }
          <LinodeConfigSelectionDrawer
            onClose={this.closeConfigDrawer}
            onSubmit={this.submitConfigChoice}
            onChange={this.selectConfig}
            open={configDrawer.open}
            configs={configDrawer.configs}
            selected={String(configDrawer.selected)}
            error={configDrawer.error}
          />
        </Grid>
      </Grid>
    );
  }
}

const getDisplayFormat = ifElse(
  compose(isEmpty, prop('hash')),
  /* is empty */
  ifElse(
    compose(gte(3), prop('length')),
    () => 'grid',
    () => 'list',
  ),
  /* is not empty */
  ifElse(
    propEq('hash', '#grid'),
    () => 'grid',
    () => 'list',
  ),
);

export const styled = withStyles(styles, { withTheme: true });

export const connected = connect<Props>(mapStateToProps);

export const enhanced = compose(
  withRouter,
  styled,
  preloaded,
  setDocs(ListLinodes.docs),
  connected,
);

export default enhanced(ListLinodes) as typeof ListLinodes;
