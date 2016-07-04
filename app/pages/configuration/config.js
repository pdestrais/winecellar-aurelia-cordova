import { Pouch } from '../../services/pouch';
import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';


@inject(F7, Router, Pouch, EventAggregator)
export class searchVin {
    heading = 'Welcome to the Aurelia Framework 7 TODO App';

    constructor(f7, router, pouch, eventAggregator) {
        console.log('Entering constructor');
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
		this.eventAggregator = eventAggregator;
        this.config = {};

        var _self = this;       
    }

    activate(){
        this.pouch.getDoc("serverUrl").then(response => {
            if (response.status == 404)
                this.config = {id:"serverUrl", serverUrl : "http://localhost:5984/cave_copy_dev" }
            else
                this.config = response
        }).catch(err => console.log("error getting serverUrl in activate"));    
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
}
