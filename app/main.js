import {bootstrap} from 'aurelia-bootstrapper-webpack';
import {I18N} from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend';
import 'framework7/dist/css/framework7.material.min.css';
import 'framework7/dist/css/framework7.material.colors.min.css';
import 'framework7/dist/js/framework7.min.js'
import './css/styles.css';
import './css/MyCellar.css';
import enTranslations from './locale/en/translation.json';
import frTranslations from './locale/fr/translation.json';
//import 'bootstrap/dist/css/bootstrap.css';

require('script!pouchdb/dist/pouchdb.js');
//require('script!jspdf/dist/jspdf.min.js');
//require("json!./locale/fr/translation.json");
//require('script!jspdf/dist/jspdf.min.js');
//var PouchDb = require('pouchdb/dist/pouchdb');

/*bootstrap(aurelia => {
    if (!global.Intl) {
        console.log('Intl not present')
        require.ensure([
            'intl',
            'intl/locale-data/jsonp/en.js'
        ], function (require) {
            require('intl');
            require('intl/locale-data/jsonp/en.js');
            boot(aurelia);
        });
    } else {
        boot(aurelia);
    }
});
*/
bootstrap(function (aurelia) {
    aurelia.use
        .standardConfiguration()
        .developmentLogging()
        .plugin('aurelia-i18n', (instance) => {
            let language = navigator.language.split('-')[0];
            // register backend plugin
            instance.i18next.use(Backend);

            function loadLocales(url, options, callback, data) {
                switch (url) {
                    case 'en':
                        callback(enTranslations, { status: '200' });
                        break;
                    case 'fr':
                        callback(frTranslations, { status: '200' });
                        break;
                    default:
                        callback(null, { status: '404' });
                        break;
                }
            }

            instance.setup({
                backend: {
                    loadPath: '{{lng}}',
                    parse: (data) => data,
                    ajax: loadLocales,
                },
                lng: language,
                attributes: ['t', 'i18n'],
                fallbackLng: 'en',
                debug: false,
            });
        })
        .plugin('aurelia-validation')
/*        .plugin('aurelia-validatejs', config => {
            let i18n = aurelia.container.get(I18N);
            config.useTranslation(error => {
                let translation = i18n.tr(error.rule, error);
                return translation !== error.rule ? translation : undefined;
            });
        })
*/        .plugin('aurelia-validatejs')
        .feature('bootstrap-validation');

    aurelia.start().then(() => aurelia.setRoot('app', document.body));
});
