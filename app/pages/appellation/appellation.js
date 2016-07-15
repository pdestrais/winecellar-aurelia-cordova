import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Pouch } from '../../services/pouch';
import { SimpleCache } from '../../services/simpleCache';
import {NewInstance} from 'aurelia-dependency-injection';
import {ValidationController, validateTrigger} from 'aurelia-validation';
import {required, email, length, date, datetime, numericality, ValidationRules} from 'aurelia-validatejs';
import {Util} from '../../services/util';
import {EventAggregator} from 'aurelia-event-aggregator';
import {I18N,BaseI18N} from 'aurelia-i18n';


@inject(F7, Router, Pouch, SimpleCache,Util,NewInstance.of(ValidationController),I18N,Element,EventAggregator)
export class appellationClass extends BaseI18N {

    errors = [];
    errorModel = {};
    intercepted = [];
    observerDisposer;
 
    constructor(f7,router, pouch,simpleCache,util,controller,i18n,element,eventAggregator) {
        console.log('Entering appellation VM constructor');
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
            .ensure('courte').required({message: "est obligatoire"}).length({minimum: 2, maximum: 6, tooShort:"est trop courte (minimum est de  %{count} caracteres)", tooLong:"est trop longue (maximum est de  %{count} caracteres)"})
            .ensure('longue').required({message: "est obligatoire"}).length({minimum: 3, maximum: 20, tooShort:"est trop courte (minimum est de  %{count} caracteres)", tooLong:"est trop longue (maximum est de  %{count} caracteres)"})
            .on(AppellationModel);

    }

     attached() {
        super.attached();
            this.i18n.updateTranslations(this.element);
    }

    activate(params) {
        var _self = this;
        if (params.id) {
//            this.pouch.getDoc(params.id).then(appellation => Object.assign(_self.appellation, appellation));
            this.pouch.getDoc(params.id).then(appellation => _self.appellation = appellation);
        }
    }
    
    saveAppellation() {
        this.errors = this.controller.validate();
        let _self = this;
        if (this.errors.length!=0 || !this.isDirty)
            _self.f7.alert("Données non valides - Veuillez corriger",'MyCellar');
        else {
            this.appellation._id = this.appellation._id || "appellation|"+this.pouch.guid();
            this.pouch.saveDoc(this.util.cleanValidatorModelObject(this.appellation)).then(response => {
//            this.pouch.saveDoc(this.appellation).then(response => {
                if (response.ok) { 
                    let _self1 = _self;
                    _self.f7.alert('Appellation sauvegardée','MyCellar',function(){
                        _self1.isDirty = false;
                        _self1.pouch.getCollection(_self1.pouch.appellationView).then(appellations => _self1.cache.set("appellationsRefList",appellations));
                        _self1.router.navigateToRoute('search');
                    });
                } else {
                    _self.f7.alert("problème dans la création ou l'update",'MyCellar');
                }
            });
        }
    }

    deleteAppellation() {
        let _self = this;
        // Check that appellation is not used for any wine
        // If it's the case, refuse to delete and show an error message.
        if (this.vins.some(function matcher(v){ return (v.appellation.id == _self.appellation._id)})) {
            _self.f7.confirm("Cette appellation est utilisée pour un vin. Il n'est pas possible de la supprimer.", 'MyCellar', function () {});            
        } else {
            this.f7.confirm('Es-tu sûr ?', 'MyCellar', function () {
                let result = _self.pouch.deleteDoc(_self.appellation).then(response => {
                    if (response.ok) {
                        let _self1 = _self;
                        _self.f7.alert('Appellation supprimée', 'MyCellar', function () {
                            // suppress from cache
                            _self1.pouch.getCollection(_self1.pouch.appellationView).then(appellations => _self1.cache.set("appellationsRefList",appellations));
                            _self1.router.navigateToRoute('search');
                        });
                    } else
                        _self.f7.alert('problème dans la suppression 1', 'MyCellar');
                }).catch(err => _self.f7.alert('problème dans la suppression 2', 'MyCellar'));
            });            
        }
    }
    
    cancel() {
        this.router.navigateBack();
    }

}

class AppellationModel {
  courte = '';
  longue = '';
  constructor(courte,longue) {
    this.courte = courte;
    this.longue = longue;
  }
}
