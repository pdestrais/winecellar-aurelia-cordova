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
    
	reportCellar() {
        this.pouch.getVins().then(vins => _self.vins = vins.map(v => v.doc));
		var $div= $("#reportContent"),
			html="";
		
		// initHome();
		var wineCollection = wineMap.values();
		var appellationCollection = appellationMap.values();
		var typeCollection = typeMap.values();
		var origineCollection = origineMap.values();
				
		/* sort wineCollection by type, origine, annee, nom */
		var sortedWineCollection = wineCollection.sort(MyCellarController.wineSorting);
		
		/* start creating html */
		html = "<h3>Contenu cave</h3>";

		$.each(MyCellarController.selectDistinctWinesTypes(sortedWineCollection), function(i1,typeItem){
			/* create HTML for type level collapsible */
			html = html + '<div data-role="collapsible-set" data-theme="a" data-content-theme="c">';
			html = html + '<div data-role="collapsible">';
			var ctype=0;
			db.query("reportVin",{reduce: '_sum', group: true, group_level: 1}, function(err, result){
				if (err) {
					$.jqlog.error("[MyCellarController.reportWine]error running report query");
					$("#generalDialog div:first-child").attr("data-theme","d");
				  	MyCellarController.showDialog("Echec", "Erreur pour créer le rapport", "Continuer", function() {},"#Home");			
				} else {
					$.each(result.rows, function(i0, item0) {
						if (item0.key==typeItem) {
							ctype = item0.value;
							$("#"+typeItem+" span:first-child").html(""+ctype);
						}
					});
				};
			});
			html = html + '<h3 id="' +typeItem+ '">' +typeItem +'<span class="ui-li-count">'+' ('+ctype+')'+'</span>'+'</h3>';
			/* create HTML for origine level collapsible */
			var selectedDistinctWinesOriginsForType = MyCellarController.selectDistinctWinesOriginsForType(sortedWineCollection,typeItem);
			var c=0;
			$.each(selectedDistinctWinesOriginsForType, function(i2,originItem){
				html = html + '<div data-role="collapsible" data-theme="b" data-content-theme="c">';
				c = MyCellarController.countWineByOriginAndType(sortedWineCollection,typeItem,originItem);
				if (c>0){
					html = html +'<h4>'+originItem+'<span class="ui-li-count">'+' ('+c+')'+'</span></h4>';
					html = html + '<ul data-role="listview" data-theme="f" data-divider-theme="b">';
					/* create year divider */
					var selectedDistinctWinesYearsForOriginsForType = MyCellarController.selectDistinctWinesYearsForOriginsForType(sortedWineCollection,typeItem,originItem);
					var c1 = 0;
					$.each(selectedDistinctWinesYearsForOriginsForType, function(i3,yearItem){
						c1 = MyCellarController.countWineByYearAndOriginAndType(sortedWineCollection,typeItem,originItem,yearItem);
						if (c1>0){
							html = html + '<li data-role="list-divider" data-theme="c">'+yearItem+'<span class="ui-li-count">'+c1+'</span></li>';
							var selectedWinesByOriginByYear = MyCellarController.selectWinesByOriginByYearAndType(sortedWineCollection,typeItem,originItem,yearItem);
							var identif='';
							$.each(selectedWinesByOriginByYear, function (i4,wineItem){
//								identif = wineItem.id+',"'+wineItem.nom.replace("'","_")+'",'+wineItem.annee;
								identif = '"'+wineItem._id+'"';
								if (wineItem.nbreBouteillesReste>0){
									html = html + "<li><a href='#' onclick='MyCellarController.loadWineAndPopulateForm("+identif+")'>";
									html = html + '<h4>'+wineItem.nom+'<span class="ui-li-count">'+wineItem.nbreBouteillesReste+'</span></h4>';
									html = html + '<p><strong>Prix : '+wineItem.prixAchat+' ('+wineItem.localisation+')</strong></p>';
									html = html + '<p>'+wineItem.remarque+'</p>';
									html = html + '</a></li>';	
								}
							});								
						}
					});
					html = html + '</ul>';						
				}
				/* close HTML for origine level collapsible */				
				html = html + '</div>';
			});
				
			/* close HTML for type level collapsible */				
			html = html + '</div>';
		});
		$div.html( html );
		$("#reportContent").trigger("create");
	}
	
	cellarToPDF() {
		// initHome();
		var wineCollection = wineMap.values();
		var appellationCollection = appellationMap.values();
		var typeCollection = typeMap.values();
		var origineCollection = origineMap.values();
		var doc = new jsPDF("landscape","cm","a4");
		var ymax = 20;
		var startY = 2.2;
		var y = startY;
		var pageNum = 0;
		var totalPerType = 0;
				
		/* sort wineCollection by type, origine, annee, nom */
		var sortedWineCollection = wineCollection.sort(MyCellarController.wineSorting);
		
		/* start creating html */

		$.each(MyCellarController.selectDistinctWinesTypes(sortedWineCollection), function(i1,typeItem){
			/* create box for type level */
			pageNum++;
			y=startY;
			MyCellarController.createNewPDFPageAndHeader(doc, pageNum);
			doc.setLineWidth(0.05);
			doc.setDrawColor(0.1);
			doc.setFillColor(255);
			doc.rect(1,y,28,0.8,"DF");
			y=y+0.5;
			doc.setFontSize(12);
			doc.setTextColor(0);
			doc.setFontStyle('bold');
			doc.text(1.2,y,typeItem);
			y=y+0.3;

			/* create box for origine level */
			var selectedDistinctWinesOriginsForType = MyCellarController.selectDistinctWinesOriginsForType(sortedWineCollection,typeItem);
			var c=0;
			$.each(selectedDistinctWinesOriginsForType, function(i2,originItem){
				c = MyCellarController.countWineByOriginAndType(sortedWineCollection,typeItem,originItem);
				if (c>0){
					// check if we have enough space for origine and at least one extra line bellow
					if (y+0.8+0.3>=ymax) {
						pageNum++;
						y=startY;
						MyCellarController.createNewPDFPageAndHeader(doc, pageNum);						
					}
					doc.setLineWidth(0.02);
					doc.setDrawColor(120);
					doc.setFillColor(150);
					doc.rect(1,y,28,0.5,"DF");
					y=y+0.35;
					doc.setFontSize(12);
					doc.setFontStyle('normal');
					doc.setTextColor(0);
					doc.text(2.2,y,originItem+" ("+c+")");
					y=y+0.25;
					/* create year divider */
					var selectedDistinctWinesYearsForOriginsForType = MyCellarController.selectDistinctWinesYearsForOriginsForType(sortedWineCollection,typeItem,originItem);
					var c1 = 0;
					doc.setFontSize(9);
					doc.setTextColor(0);
					doc.setDrawColor(0);					
					$.each(selectedDistinctWinesYearsForOriginsForType, function(i3,yearItem){
						var selectedWinesByOriginByYear = MyCellarController.selectWinesByOriginByYearAndType(sortedWineCollection,typeItem,originItem,yearItem);
						$.each(selectedWinesByOriginByYear, function (i4,wineItem){
							if (wineItem.nbreBouteillesReste>0){
								if (y+0.5>=ymax) {
									pageNum++;
									y=startY+0.1;
									MyCellarController.createNewPDFPageAndHeader(doc, pageNum);
									doc.setFontSize(9);
									doc.setTextColor(0);
									doc.setDrawColor(0);					
								}
								y=y+0.3;
								doc.text(1.2,y,""+wineItem.annee);
								doc.text(3,y,wineItem.nom);
								doc.text(11,y,wineItem.appellation.longue);
								doc.text(17.5,y,""+wineItem.prixAchat);
								doc.text(19,y,""+wineItem.nbreBouteillesReste);
								doc.text(20.5,y,wineItem.localisation);
								doc.text(23.3,y,wineItem.remarque);
								y=y+0.1;
								doc.setLineWidth(0.02);
								doc.rect(1,y,28,0.0,"DF");
//								doc.lines(28,y,[1,y],[1.0,1.0],"S",false);
							}
						});								
					});
				}
				/* after origine level */	
				totalPerType = totalPerType+ c;
			});
				
			/* after type level */		
			doc.setFontSize(14);
			doc.setTextColor(0);
			doc.setDrawColor(0);					
			if (y+1.2>=ymax) {
				pageNum++;
				y=startY;
				MyCellarController.createNewPDFPageAndHeader(doc, pageNum);
			}
			y=y+1;
			doc.text(10,y,"Total des  "+typeItem+" : "+totalPerType);
			totalPerType = 0;
		});
		doc.save('Contenu cave.pdf');
	}
	
	createNewPDFPageAndHeader(doc,pgNum) {
		if (pgNum>1) {
			doc.addPage();
		}
		// adding header
		doc.setFontSize(18);
		doc.setFontStyle('normal');
//		doc.setFont("Verdana");
		doc.text(12, 0.7, "Contenu cave le "+moment().format('DD/MM/YYYY'));
		doc.setLineWidth(0.05);
		doc.setDrawColor(50);
		doc.setFillColor(100);
		doc.rect(1,1.3,28,1,"DF");
		doc.setFontSize(12);
		doc.setTextColor(255);
		doc.setFontStyle('bold');
		doc.text(1.2,2.1,"Année");
		doc.text(3,2.1,"Nom");
		doc.text(11,2.1,"Appellation");
		doc.text(16.5,2.1,"Prix achat");
		doc.text(19,2.1,"Reste");
		doc.text(20.5,2.1,"Loc.G/D.y.x");
		doc.text(23.3,2.1,"Commentaire");
		
		// adding footer
		doc.setLineWidth(0.05);
		doc.setDrawColor(50);
		doc.setFillColor(100);
		doc.rect(1,20,28,0.0,"DF");
		doc.setFontSize(9);
		doc.setFontStyle('normal');
		doc.setTextColor(0);
//		doc.setFont("Verdana");
		doc.text(1, 20.3, moment().format('DD/MM/YYYY'));
		doc.text(27, 20.3, "page"+pgNum);
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

	origineSorting(a,b) {
	    var aOr = a.pays+a.region;
	    var bOr = b.pays+b.region;
	    if (aOr > bOr) {
	        return 1;
	    } else if (aOr < bOr) { 
	        return -1;
	    }
	}

	selectDistinctWinesTypes(collection) {
		var selection =[];
		collection.forEach(function(i,item){
			if ($.inArray(item.type.nom, selection)==-1) 
				selection.push(item.type.nom);
		});
		return selection;
	}

	selectDistinctWinesOriginsForType(collection,sType) {
		var selection =[];
		$.each(collection, function(i,item){
			if (item.type.nom == sType && $.inArray(item.origine.pays+' - '+item.origine.region, selection)==-1) 
				selection.push(item.origine.pays+' - '+item.origine.region);
		});
		return selection;
	}

	selectDistinctWinesYearsForOriginsForType(collection,sType,sOrigin) {
		var years = [];
		$.each(collection, function(i,item){
			if (item.type.nom == sType && (item.origine.pays+' - '+item.origine.region) == sOrigin && $.inArray(item.annee, years)==-1) 
				years.push(item.annee);
		});
		return years;
	}

	selectWinesByType(typeId) {
		var selection =[];
		$.each(wineCollection, function(i,item){
			if (item.type._id == typeId) 
				selection.push(item);
		});
		return selection;
	}

	selectWinesByOriginByYearAndType(collection,sType,sOrigin,year) {
		var selection =[];
		$.each(collection, function(i,item){
			if (item.type.nom == sType && (item.origine.pays+' - '+item.origine.region) == sOrigin && item.annee == year) 
				selection.push(item);
		});
		return selection;
	}

	countWineByOriginAndType(collection,sType,sOrigin) {
		count = 0;
		$.each(collection, function(i,item){
			if (item.type.nom == sType && (item.origine.pays+' - '+item.origine.region) == sOrigin) 
				count = count + parseFloat(item.nbreBouteillesReste);
		});
		return count;
	}

	countWineByYearAndOriginAndType(collection,sType,sOrigin,year) {
		count = 0;
		$.each(collection, function(i,item){
			if (item.type.nom == sType && (item.origine.pays+' - '+item.origine.region) == sOrigin && item.annee == year) 
				count = count + parseFloat(item.nbreBouteillesReste);
		});
		return count;
	}

}
