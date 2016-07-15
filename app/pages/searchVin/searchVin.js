import { Pouch } from '../../services/pouch';
import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {I18N,BaseI18N} from 'aurelia-i18n';


@inject(F7, Router, Pouch, I18N,Element,EventAggregator)
export class searchVin extends BaseI18N {
    heading = 'Welcome to the Aurelia Framework 7 MyCellar App';
    vins = [];
    vinsRawResults = [];
    vinsForSearch = [];
    stock = true;
    _searchText = '';

    constructor(f7, router, pouch,i18n,element,eventAggregator) {
        console.log('Entering searchVin constructor');
        super(i18n,element,eventAggregator);
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
		this.eventAggregator = eventAggregator;
        this.i18n = i18n;
        this.element = element;        
/*        var _self = this;
*/    }
    
    get searchText() {
        return this._searchText;
    }
    set searchText(newValue) {
        this._searchText = newValue;
        this.vinsForSearch = [];
        if (newValue != '') {
            if (this._searchText.length>=3) {
            // Find matched items
                for (var i = 0; i < this.vins.length; i++) {
                    if (this.vins[i].nom.toLowerCase().indexOf(this._searchText.toLowerCase()) >= 0 && 
                    ( (this.stock && this.vins[i].nbreBouteillesReste>0) || (!this.stock) ) ) 
                        this.vinsForSearch.push(this.vins[i]);
                }
            }
        }
    }
    
    clearSearchBar() {
        this._searchText='';
        this.vinsForSearch = [];
    }

    attached() {
        super.attached();
        this.i18n.updateTranslations(this.element);
        var _self = this;
        this.eventAggregator.subscribe("SyncStarts", function(){_self.showLoadingModal()} );
        this.eventAggregator.subscribe("dbUpToDate", function(){
                console.log('dbUpToDate Event received in attached'); 
                _self.pouch.getVins().then(vins => _self.vins = vins.map(v => v.doc));                
        });
        return this.loadVins();
    }

    loadVins() {
        var _self = this;
        return _self.pouch.getVins().then(vins => _self.vins = vins.map(v => v.doc));        
    }
    
    viewVin(id) {
        this.router.navigateToRoute('vin', {id: id});
    }

    showLoadingModal() {
        var _self=this;
        this.eventAggregator.subscribeOnce("dbUpToDate", function() {
            console.log('dbUpToDate Event received in showLoadingModal'); 
            _self.f7.hidePreloader();
        });
        this.f7.showPreloader("Chargement des vins ...");
    }
     
}
