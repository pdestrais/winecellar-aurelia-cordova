import {bootstrap} from 'aurelia-bootstrapper-webpack';
import {I18N} from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend';
import 'framework7/dist/css/framework7.material.min.css';
import 'framework7/dist/css/framework7.material.colors.min.css';
import 'framework7/dist/js/framework7.min.js'
import '../styles/style.css';
import './css/MyCellar.css';
//import 'bootstrap/dist/css/bootstrap.css';

require('script!pouchdb/dist/pouchdb.js');
//require('script!jspdf/dist/jspdf.min.js');
//var PouchDb = require('pouchdb/dist/pouchdb');

bootstrap(function (aurelia) {
    aurelia.use
        .standardConfiguration()
        .developmentLogging()
        .plugin('aurelia-i18n', (instance) => {
            instance.i18next.use(Backend);
            return instance.setup({
                backend: {
                loadPath: '/locale/{{lng}}/{{ns}}.json'
                },
                lng: 'fr',
                attributes : ['t','i18n'],
                fallbackLng : 'en',
                debug : false
            });
        })
/*        .plugin('aurelia-validatejs');
*/        .plugin('aurelia-validatejs', config => {
            let i18n = aurelia.container.get(I18N);
            config.useTranslation(error => {
                let translation = i18n.tr(error.rule, error);
                return translation !== error.rule ? translation : undefined;
            });
        });

    aurelia.start().then(() => aurelia.setRoot('app', document.body));
});
