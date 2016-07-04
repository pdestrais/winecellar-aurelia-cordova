import { Pouch } from '../../services/pouch';
import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { SimpleCache } from '../../services/simpleCache';


@inject(F7, Router, Pouch, SimpleCache)
export class ListAppellations {
    heading = 'Welcome to the Aurelia Framework 7 TODO App';

    constructor(f7, router, pouch, simpleCache) {
        console.log("entering todos constructor");
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
        this.cache = simpleCache;
        this.origines = [];
        this.vins = [];

        this.pouch.getCollection(this.pouch.origineView).then(origines => origines.map(a => this.origines.push(a.value)));
        this.pouch.getCollection(this.pouch.vinView).then(vins => vins.map(v => this.vins.push(v.value)));
    }

    addOrigine() {
        this.router.navigate('/appellation');
    }

    viewOrigine(origine) {
        this.router.navigateToRoute('origine', {id: origine._id});
    }


  }
