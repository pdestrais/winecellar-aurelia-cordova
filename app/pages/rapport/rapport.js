import { F7 } from '../../services/f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Pouch } from '../../services/pouch';
import { SimpleCache } from '../../services/simpleCache';

@inject(F7, Router, Pouch, SimpleCache)
export class Rapport {
    constructor(f7,router, pouch, simpleCache) {
        console.log('Entering rapport constructor');
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
        this.cache = simpleCache;
        this.vin = {}
        this.origines = this.cache.get("originesRefList");
        this.appellations = this.cache.get("appellationsRefList");
        this.types = this.cache.get("typesRefList");
        this.rapport = [];
		this.selection =[];
		this.selected = {};
		this.prepareData();
    }
    
    prepareData(){  
      var _self = this;
      this.pouch.getVins().then(vins => _self.vins = vins.map(v => v.doc))
      .then(() => {
          var sortedWineCollection = _self.vins.sort(_self.wineSorting);
          // first report dimension is wine type
          _self.rapport = _self.selectAndCountDistinctWineTypes(sortedWineCollection);
          // for each type, the origine dimension is created
          var _self1=_self;
          _self.rapport.forEach(function(item,i){
			_self1.rapport[i].origines = _self1.selectedAndCountDistinctWinesOriginsForType(sortedWineCollection,item);
			var _self2=_self1;
			_self1.rapport[i].origines.forEach(function(item1,i1){
				_self2.rapport[i].origines[i1].annees = _self2.selectedAndCountDistinctWinesYearsForOriginForType(sortedWineCollection,item1,item);
			})
          });
		  console.log("after");
      });
    }

    viewVin(id) {
        this.router.navigateToRoute('vin', {id: id});
    }

    // returns collection of types (object : nom,count) of wines still present in the cellar
    selectAndCountDistinctWineTypes(collection){
		this.selection = [];
        collection.forEach(function(item,i){
				if (item.nbreBouteillesReste>0) {
					if (!this.selection.some(function matcher(v){ return (v.nom == item.type.nom)})) {
						this.selection.push({nom:item.type.nom,count:0,origines:[]});
					}
					this.selected = this.selection.find(function matcher(i){return i.nom == item.type.nom});
					if (this.selected)
						this.selected.count=this.selected.count+parseInt(item.nbreBouteillesReste);                					
				}
        },this);
        return this.selection;
    }
    
    selectedAndCountDistinctWinesOriginsForType(collection,type){
		this.selection = [];
        collection.forEach(function(item,i){
				if (item.nbreBouteillesReste>0 && item.type.nom == type.nom) {
					if (!this.selection.some(function matcher(v){ return (v.nom == (item.origine.pays+' - '+item.origine.region))})) {
						this.selection.push({nom:item.origine.pays+' - '+item.origine.region,count:0,annee:[]});
					}
					this.selected = this.selection.find(function matcher(i){return i.nom == (item.origine.pays+' - '+item.origine.region)})
					if (this.selected)
						this.selected.count=this.selected.count+parseInt(item.nbreBouteillesReste);                					
				}               
        },this);
        return this.selection;
    }

    selectedAndCountDistinctWinesYearsForOriginForType(collection,origin,type){
		this.selection = [];
        collection.forEach(function(item,i){
				if (item.nbreBouteillesReste>0 && item.type.nom == type.nom && (item.origine.pays+' - '+item.origine.region) == origin.nom) {
					if (!this.selection.some(function matcher(v){ return (v.annee == item.annee)})) {
						this.selection.push({annee:item.annee,count:0,wines:[]});
					}
					this.selected = this.selection.find(function matcher(i){return i.annee == item.annee})
					if (this.selected) {
						this.selected.count=this.selected.count+parseInt(item.nbreBouteillesReste);
						this.selected.wines.push(item);
					}
				}               
        },this);
        return this.selection;
    }

    selectedDistinctWinesforYearForOriginForType(collection,year,origin,type){
		this.selection = [];
        collection.forEach(function(item,i){
				if (item.nbreBouteillesReste>0 && item.type.nom == type.nom 
												&& (item.origine.pays+' - '+item.origine.region) == origin.nom
												&& (item.annee == year.annee)) {
					this.selection.push(item);
				}               
        },this);
        return this.selection;
    }

    
    wineSorting(a,b) {
	    if (a.type.nom > b.type.nom) {
	        return 1;
	    } else if (a.type.nom < b.type.nom) { 
	        return -1;
	    }

	    // Else go to the 2nd item : origine
	    var aOr = a.origine.pays+a.origine.region;
	    var bOr = b.origine.pays+b.origine.region;
	    if (aOr > bOr) {
	        return 1;
	    } else if (aOr < bOr) { 
	        return -1;
	    }

	    // Else go to the 3rd item : annee
	    if (a.annee > b.annee) {
	        return 1;
	    } else if (a.annee < b.annee) { 
	        return -1;
	    }

	    // Else go to the 3rd item : nom
	    if (a.nom > b.nom) { 
	        return -1;
	    } else if (a.nom < b.nom) {
	        return 1
	    } else { // nothing to split them
	        return 0;
	    }
	}

}
