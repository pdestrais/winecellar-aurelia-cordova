import { Pouch } from '../../services/pouch';
import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {I18N} from 'aurelia-i18n';


@inject(F7, Router, Pouch, EventAggregator,I18N)
export class Config {
    heading = 'Wine Cellar app config';

    constructor(f7, router, pouch, eventAggregator,i18n) {
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
		this.eventAggregator = eventAggregator;
        this.config = {};
        this.locale="en-US";
        this.supportedLanguages=[{language:"français",locale:"fr-FR"},{language:"english",locale:"en-US"}]
        this.i18n = i18n
//        var _self = this;       
    }

    activate(){
        this.pouch.getDoc("config").then(response => {
            if (response.status == 404)
                this.config = {id:"config", serverUrl : "http://localhost:5984/cave_copy_dev", locale :"en-US" }
            else
                this.config = response
        }).catch(err => console.log("error getting config in activate"));    
    }
    
    saveConfig() {
        let _self = this
        this.eventAggregator.subscribeOnce("dbUpToDate", function() {
            console.log('dbUpToDate Event received in save config'); 
            _self.f7.hidePreloader();
            _self.f7.alert('url serveur DB changée', 'Confirmation');
            _self.router.navigate('/search');
        });
        this.pouch.swithchDB(this.config);
        this.f7.showPreloader("Changement de serveur ...");
    }

    destroyLocalDB() {
        this.pouch.nuke();
    }
    
    changeLanguage() {
        let _self = this;
        this.i18n
            .setLocale(this.config.locale)
            .then( () => {
                _self.f7.alert('Langue adaptée', 'Confirmation');
        });
        this.pouch.saveDoc(this.config);
    }
}
