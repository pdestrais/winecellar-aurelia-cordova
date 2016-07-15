import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Pouch } from '../../services/pouch';
import { SimpleCache } from '../../services/simpleCache';
import {NewInstance} from 'aurelia-dependency-injection';
import {ValidationController, validateTrigger} from 'aurelia-validation';
import {required, email, length, date, datetime, numericality, ValidationRules} from 'aurelia-validatejs';
import {Util} from '../../services/util';
import {I18N,BaseI18N} from 'aurelia-i18n';
import {EventAggregator} from 'aurelia-event-aggregator';


@inject(F7, Router, Pouch, SimpleCache,Util,NewInstance.of(ValidationController),I18N,Element,EventAggregator)
export class origin extends BaseI18N {

    errors = [];
    errorModel = {};
    intercepted = [];
    observerDisposer;
 
    constructor(f7,router, pouch,simpleCache,util,controller,i18n,element,eventAggregator) {
        super(i18n,element,eventAggregator);
        this.i18n = i18n;
        this.element = element;        
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
        this.util = util;
        this.cache = simpleCache;
        this.controller = controller;
        this.appellation = new AppellationModel("",""); 
        this.isDirty = false;
        this.vins = this.pouch.getVins().then(vins => this.vins = vins.map(v => v.doc));
         ValidationRules
            .ensure('pays').required({message: "est obligatoire"})
            .ensure('region').required({message: "est obligatoire"})
            .on(OrigineModel);
    }

     attached() {
        super.attached();
            this.i18n.updateTranslations(this.element);
    }

    activate(params) {
        var _self = this;
        if (params.id) {
            this.pouch.getDoc(params.id).then(origine => _self.origine = origine);
        }
    }
    
    saveOrigine() {
        this.errors = this.controller.validate();
        let _self = this;
        if (this.errors.length!=0 || !this.isDirty)
            _self.f7.alert("Données non valides - Veuillez corriger",'MyCellar');
        else {
            this.origine._id = this.origine._id || "appellation|"+this.pouch.guid();
            this.pouch.saveDoc(this.util.cleanValidatorModelObject(this.origine)).then(response => {
                    if (response.ok) { 
                        _self.f7.alert('Origine sauvegardée','MyCellar',function(){
                            _self.isDirty = false;
                            _self.router.navigateToRoute('search');
                        });
                    } else {
                        _self.f7.alert("problème dans la création ou l'update",'MyCellar');
                    }
                });
        }
    }

    deleteOrigine() {
        let _self = this;
        // Check that appellation is not used for any wine
        // If it's the case, refuse to delete and show an error message.
        if (this.vins.some(function matcher(v){ return (v.origine.id == _self.origine._id)})) {
            _self.f7.confirm("Cette origine est utilisée pour un vin. Il n'est pas possible de la supprimer.", 'MyCellar', function () {});            
        } else {
            this.f7.confirm('Es-tu sûr ?', 'MyCellar', function () {
                let result = _self.pouch.deleteDoc(_self.origine).then(response => {
                    if (response.ok) {
                        var _self1 = _self;
                        _self.f7.alert('Origine supprimée', 'MyCellar', function () {
                            // suppress from cache
                            _self1.pouch.getCollection(_self1.pouch.origineView).then(origines => _self1.cache.set("originesRefList",origines));
                            _self1.router.navigateToRoute('search');
                        });
                    } else
                        _self.f7.alert('problème dans la suppression', 'MyCellar');
                }).catch(err => _self.f7.alert('problème dans la suppression', 'MyCellar'));
            });            
        }
    }
    
    cancel() {
        this.router.navigateBack();
    }

}

class OrigineModel {
  pays = '';
  region = '';
  constructor(pays,region) {
    this.pays = pays;
    this.region = region;
  }
}
