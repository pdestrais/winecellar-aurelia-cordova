import { Pouch } from '../../services/pouch';
import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { SimpleCache } from '../../services/simpleCache';
import {I18N,BaseI18N} from 'aurelia-i18n';
import {EventAggregator} from 'aurelia-event-aggregator';


@inject(F7, Router, Pouch, SimpleCache,I18N,Element,EventAggregator)
export class ListAppellations extends BaseI18N {
    heading = 'Welcome to the Aurelia Framework 7 wineCellar App';

    constructor(f7, router, pouch, simpleCache,i18n,element,eventAggregator) {
        super(i18n,element,eventAggregator);
        this.i18n = i18n;
        this.element = element;        
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
        this.cache = simpleCache;
        this.appellations = [];
        this.vins = [];

        this.pouch.getCollection(this.pouch.appellationView).then(appellations => appellations.map(a => this.appellations.push(a.value)));
        this.pouch.getCollection(this.pouch.vinView).then(vins => vins.map(v => this.vins.push(v.value)));
    }

     attached() {
        super.attached();
            this.i18n.updateTranslations(this.element);
    }

    addAppellation() {
        this.router.navigate('/appellation');
    }

    viewAppellation(appellation) {
        this.router.navigateToRoute('appellation', {id: appellation._id});
    }


  }
