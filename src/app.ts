import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';
import { BindingSignaler } from 'aurelia-templating-resources';
import { Utils } from 'services/utils';
import '../static/styles.scss';
import { Web3Service } from './services/Web3Service';

@autoinject
export class App {

  public static timezone: any;

  public static hasDashboard(schemeName: string): boolean {
    return App.schemeDashboards.indexOf(schemeName) !== -1;
  }

  private static schemeDashboards = [
    'Auction4Reputation',
    'ExternalLocking4Reputation',
    'LockingEth4Reputation',
    'LockingToken4Reputation',
    'DaoStorytelling',
  ];

  /**
   * public for tests
   */
  public router: Router;

  private intervalId: any;

  constructor(
    private web3Service: Web3Service,
    private signaler: BindingSignaler,
    private eventAggregator: EventAggregator
  ) {
  }

  public activate() {
    this.intervalId = setInterval(async () => {
      this.signaler.signal('secondPassed');
      let blockDate;
      if (this.web3Service.isConnected) {
        blockDate = await Utils.lastBlockDate(this.web3Service.web3);
      }
      this.eventAggregator.publish('secondPassed', blockDate);
    }, 1000);
  }

  public attached() {
    ($('body') as any)
      .bootstrapMaterialDesign({ global: { label: { className: 'bmd-label-floating' } } });

  }

  private configureRouter(config: RouterConfiguration, router: Router) {

    config.title = 'dxDAO';
    config.options.pushState = true;
    config.options.root = '/';
    /**
     * first set the landing page.
     * it is possible to be connected but have the wrong chain.
     */
    config.map([
      {
        moduleId: PLATFORM.moduleName('./landing'),
        name: 'landing',
        nav: false,
        route: ['', '/', 'landing', 'home'],
        title: '',
      },
      {
        moduleId: PLATFORM.moduleName('./organizations/dashboard'),
        name: 'dashboard',
        nav: false,
        // 'address' will be present in the object passed to the 'activate' method of the viewmodel
        route: ['dashboard'],
        title: 'Stake for Your Vote',
      }
      ,
      {
        moduleId: PLATFORM.moduleName('./organizations/dashboard'),
        name: 'stake-for-your-vote',
        nav: false,
        // 'address' will be present in the object passed to the 'activate' method of the viewmodel
        route: ['stake-for-your-vote'],
        title: 'Stake for Your Vote',
      }
      , {
        moduleId: PLATFORM.moduleName('./txInfo/txInfo'),
        // 'txHash' will be present in the object passed to the 'activate' method of the viewmodel
        name: 'txInfo',
        nav: false,
        route: ['txInfo/:txHash'],
        title: 'Transaction Information',
      },
      , {
        moduleId: PLATFORM.moduleName('./liquidity/liquidity'),
        name: 'liquidity',
        nav: false,
        route: ['liquidity'],
        title: 'Token Liquidity',
      },
      , {
        moduleId: PLATFORM.moduleName('./status/status'),
        name: 'status',
        nav: false,
        route: ['status'],
        title: 'Initialization Period Status',
      },
    ]);

    config.fallbackRoute('');

    this.router = router;
  }
}
