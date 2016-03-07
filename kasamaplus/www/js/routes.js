angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    abstract:true
  })

  .state('menu.sETUP', {
    url: '/page7',
    views: {
      'side-menu21': {
        templateUrl: 'templates/sETUP.html',
        controller: 'sETUPCtrl'
      }
    }
  })

  .state('menu.sETUP1', {
    url: '/page22',
    views: {
      'side-menu21': {
        templateUrl: 'templates/sETUP1.html',
        controller: 'sETUP1Ctrl'
      }
    }
  })

  .state('menu.refundSummary', {
    url: '/page14',
    views: {
      'side-menu21': {
        templateUrl: 'templates/refundSummary.html',
        controller: 'refundSummaryCtrl'
      }
    }
  })

  .state('menu.userCardSummary', {
    url: '/page16',
    views: {
      'side-menu21': {
        templateUrl: 'templates/userCardSummary.html',
        controller: 'userCardSummaryCtrl'
      }
    }
  })

  .state('menu.sellSummary', {
    url: '/page11',
    views: {
      'side-menu21': {
        templateUrl: 'templates/sellSummary.html',
        controller: 'sellSummaryCtrl'
      }
    }
  })

  .state('menu.readCard', {
    url: '/page10',
    views: {
      'side-menu21': {
        templateUrl: 'templates/readCard.html',
        controller: 'readCardCtrl'
      }
    }
  })

  .state('menu.meter', {
    url: '/page25',
    views: {
      'side-menu21': {
        templateUrl: 'templates/meter.html',
        controller: 'meterCtrl'
      }
    }
  })

  .state('menu.refund', {
    url: '/page15',
    views: {
      'side-menu21': {
        templateUrl: 'templates/refund.html',
        controller: 'refundCtrl'
      }
    }
  })

  .state('menu.sell', {
    url: '/page9',
    views: {
      'side-menu21': {
        templateUrl: 'templates/sell.html',
        controller: 'sellCtrl'
      }
    }
  })

  .state('menu.userCard', {
    url: '/page12',
    views: {
      'side-menu21': {
        templateUrl: 'templates/userCard.html',
        controller: 'userCardCtrl'
      }
    }
  })

  .state('menu.resetCard', {
    url: '/page17',
    views: {
      'side-menu21': {
        templateUrl: 'templates/resetCard.html',
        controller: 'resetCardCtrl'
      }
    }
  })

  .state('menu.adminCard', {
    url: '/page18',
    views: {
      'side-menu21': {
        templateUrl: 'templates/adminCard.html',
        controller: 'adminCardCtrl'
      }
    }
  })

  .state('menu.restoreCard', {
    url: '/page19',
    views: {
      'side-menu21': {
        templateUrl: 'templates/restoreCard.html',
        controller: 'restoreCardCtrl'
      }
    }
  })

  .state('menu.reissueCardSummary', {
    url: '/page21',
    views: {
      'side-menu21': {
        templateUrl: 'templates/reissueCardSummary.html',
        controller: 'reissueCardSummaryCtrl'
      }
    }
  })

  .state('menu.reissueCard', {
    url: '/page20',
    views: {
      'side-menu21': {
        templateUrl: 'templates/reissueCard.html',
        controller: 'reissueCardCtrl'
      }
    }
  })

  .state('menu.electricCard', {
    url: '/page13',
    views: {
      'side-menu21': {
        templateUrl: 'templates/electricCard.html',
        controller: 'electricCardCtrl'
      }
    }
  })

  .state('menu.login', {
    url: '/page8',
    views: {
      'side-menu21': {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      }
    }
  })

  .state('menu.aboutUs', {
    url: '/page23',
    views: {
      'side-menu21': {
        templateUrl: 'templates/aboutUs.html',
        controller: 'aboutUsCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/side-menu21/page13')

  

});