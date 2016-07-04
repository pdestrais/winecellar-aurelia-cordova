import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Pouch } from '../../services/pouch';
import { SimpleCache } from '../../services/simpleCache';
import {NewInstance} from 'aurelia-dependency-injection';
import {ValidationController, validateTrigger} from 'aurelia-validation';
import {required, email, length, date, datetime, numericality, ValidationRules} from 'aurelia-validatejs';

@inject(F7, Router, Pouch, SimpleCache,NewInstance.of(ValidationController))
export class vin {
    constructor(f7,router, pouch, simpleCache,controller) {
        console.log('Entering vin constructor');
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
        this.cache = simpleCache;
        this.controller = controller;
        this.vin = new VinModel("","","","","",""," ","D.y.x","75");
        this.isDirty = false;
        console.log('Loading reference values');
        this.origines = this.cache.get("originesRefList");
        this.appellations = this.cache.get("appellationsRefList");
        this.types = this.cache.get("typesRefList");    
        ValidationRules
            .ensure('nom').required({message: "est obligatoire"})
            .ensure('annee').required({message: "est obligatoire"})
            .ensure('nbreBouteillesAchat').required({message: "est obligatoire"})
            .ensure('nbreBouteillesReste').required({message: "est obligatoire"})
            .ensure('prixAchat').required({message: "est obligatoire"})
            .ensure('dateAchat').required({message: "est obligatoire"})
            .ensure('remarque').required({message: "est obligatoire"})
            .ensure('localisation').required({message: "est obligatoire"})
            .ensure('contenance').required({message: "est obligatoire"})
            .on(VinModel);
    
    }
    
    setAnnee() {
        console.log("setAnnee called")
    }
    
    activate(params) {
        console.log('Vin activate called');
        console.dir(this.appellations);
        var _self = this;
        if (params.id) {
            return this.pouch.getDoc(params.id).then(vin => Object.assign(_self.vin, vin));
//            return this.pouch.getDoc(params.id).then(vin => _self.vin = vin);
        }
    }
    
    saveVin() {
      let _self = this;
      let errors = this.controller.validate();
      if (errors.length == 0) {
        if (this.isDirty) {
                this.vin.lastUpdated = new Date().toLocaleString();
                var selOrigine = this.origines.find(function matcher(origine) {return (origine.id == _self.vin.origine.id)});
                this.vin.origine = {id:selOrigine.doc._id,pays:selOrigine.doc.pays,region:selOrigine.doc.region};
                var seltype = this.types.find(function matcher(type) {return (type.id == _self.vin.type.id)});
                this.vin.type = {id:seltype.doc._id,nom:seltype.doc.nom};
                var selappellation = this.appellations.find(function matcher(appellation) {return (appellation.id == _self.vin.appellation.id)});
                this.vin.appellation = {id:selappellation.doc._id,courte:selappellation.doc.courte,longue:selappellation.doc.longue};
                this.vin.history.push({date:this.vin.lastUpdated,reste:this.vin.nbreBouteillesReste});
                this.pouch.saveVin(this.vin)
                    .then(response => {
                        let _self1 = _self
                        if (response.ok) { 
                            _self1.f7.alert('Vin sauvegardé','MyCellar',function(){
                                console.log("sauvegarde");
                                _self1.isDirty = false;
                                _self1.router.navigateToRoute('search');
                            });
                        } else {
                            _self1.f7.alert("problème dans la création ou l'update",'MyCellar');
                        }
                    });
            }          
      } else {
          this.f7.alert("Des erreurs de validation subsistent",'MyCellar');
      }
    }

    deleteVin() {
        let _self = this;
        this.f7.confirm('Es-tu sûr ?', 'MyCellar', function () {
            let result = _self.pouch.deleteDoc(_self.vin).then(response => {
                if (response.ok)
                    _self.f7.alert('Vin supprimé', 'MyCellar', function () {
                        _self.isDirty = false;
                        _self.router.navigateToRoute('search');
                    });
                else
                    _self.f7.alert('problème dans la suppression', 'MyCellar');
                }
            ).catch(err => _self.f7.alert('problème dans la suppression', 'MyCellar'));
        });
    }
    
    cancel() {
        this.router.navigateBack();
    }
}

class VinModel {
  constructor(nom,annee,nbreBouteillesAchat,nbreBouteillesReste,prixAchat,dateAchat,remarque,localisation,contenance) {
    this.nom = nom;
    this.annee = annee;
    this.nbreBouteillesAchat = nbreBouteillesAchat;
    this.nbreBouteillesReste = nbreBouteillesReste;
    this.prixAchat = prixAchat;
    this.dateAchat = dateAchat;
    this.remarque = remarque;
    this.localisation = localisation;
    this.contenance = contenance;
    this.history = [];
  }
}