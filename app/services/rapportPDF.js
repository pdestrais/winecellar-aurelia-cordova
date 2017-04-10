import { F7 } from './f7';
import {inject} from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Pouch } from './pouch';
import { SimpleCache } from './simpleCache';
import { Rapport } from '../pages/rapport/rapport' 

@inject(F7, Router, Pouch, SimpleCache, Rapport)
export class RapportPDF {
    constructor(f7,router, pouch, simpleCache, rapportClass) {
        console.log('Entering rapport constructor');
        this.f7 = f7;
        this.router = router;
        this.pouch = pouch;
        this.cache = simpleCache;
        this.vin = {}
/*        this.origines = this.cache.get("originesRefList");
        this.appellations = this.cache.get("appellationsRefList");
        this.types = this.cache.get("typesRefList");
*/        this.rapport = [];
		this.selection =[];
		this.selected = {};
        this.rapportClass = rapportClass;
        this.doc = new jsPDF("landscape","cm","a4");
    }
    
    cellarToPDF () {
        // PDF doc initialization
		var yPageMax = 20;
		var startY = 2.2;
		var y = startY;
		var pageNum = 0;

        var _self = this;
        this.pouch.getVins().then(vins => _self.vins = vins.map(v => v.doc))
        .then(() => {
            var sortedWineCollection = _self.vins.sort(_self.rapportClass.wineSorting);
            // first report dimension is wine type
            _self.rapport = _self.rapportClass.selectAndCountDistinctWineTypes(sortedWineCollection);
            // for each type, the origine dimension is created
            var _self1=_self;
            _self.rapport.forEach(function(item,i){
                // Page construction - Types
                pageNum++;
                y=startY;
                _self1.createNewPDFPageAndHeader(pageNum);
                _self1.doc.setLineWidth(0.05);
                _self1.doc.setDrawColor(0.1);
                _self1.doc.setFillColor(255);
                _self1.doc.rect(1,y,28,0.8,"DF");
                y=y+0.5;
                _self1.doc.setFontSize(12);
                _self1.doc.setTextColor(0);
                _self1.doc.setFontStyle('bold');
                _self1.doc.text(1.2,y,item.nom+" ("+item.count+")");
                y=y+0.3;

                // second report dimension is wine origin            
                _self1.rapport[i].origines = _self1.rapportClass.selectedAndCountDistinctWinesOriginsForType(sortedWineCollection,item);
                    var _self2=_self1;
                    _self1.rapport[i].origines.forEach(function(item1,i1){
                        if (item1.count>0){
                            // check if we have enough space for origine and at least one extra line bellow
                            if (y+0.8+0.3>=yPageMax) {
                                pageNum++;
                                y=startY;
                                _self1.createNewPDFPageAndHeader(pageNum);						
                            }
                            _self1.doc.setLineWidth(0.02);
                            _self1.doc.setDrawColor(120);
                            _self1.doc.setFillColor(150);
                            _self1.doc.rect(1,y,28,0.5,"DF");
                            y=y+0.35;
                            _self1.doc.setFontSize(12);
                            _self1.doc.setFontStyle('normal');
                            _self1.doc.setTextColor(0);
                            _self1.doc.text(2.2,y,item1.nom+" ("+item1.count+")");
                            y=y+0.25;
                            /* create year divider */
                            _self1.doc.setFontSize(9);
                            _self1.doc.setTextColor(0);
                            _self1.doc.setDrawColor(0);					
                            /*					var selectedDistinctWinesYearsForOriginsForType = MyCellarController.selectDistinctWinesYearsForOriginsForType(sortedWineCollection,typeItem,originItem);
                                                var c1 = 0;
                            */
                            // third report dimension is wine years            
                            _self2.rapport[i].origines[i1].annees = _self2.rapportClass.selectedAndCountDistinctWinesYearsForOriginForType(sortedWineCollection,item1,item);
                            var _self3=_self2;
                            _self2.rapport[i].origines[i1].annees.forEach(function(yearItem,iYear){
                                _self3.rapport[i].origines[i1].annees[iYear].wines = _self2.rapportClass.selectedDistinctWinesforYearForOriginForType(sortedWineCollection,yearItem,item1,item);                  
                                var _self4=_self3;
                                _self3.rapport[i].origines[i1].annees[iYear].wines.forEach(function(wineItem,iWine){
                                    let ytemp,ymax,c;
                                    if (wineItem.nbreBouteillesReste>0){
                                        //Compute how much space is needed for the next line to display :
                                        //- minimum 0.3 in no comment history, and only one location.
                                        //- otherwize : 0.3 * max (# of comments in history, # of locations) 
                                        let commentsHistoryNbr = 0;
                                        if (wineItem.history)
                                            wineItem.history.map( (value,index) =>  {   
                                                                                        if (value.comment && value.type=="comment" && value.comment.trim()!="") {
                                                                                            commentsHistoryNbr++;
                                                                                        }
                                                                                    });
                                        let locationNbr = 0;
                                        wineItem.localisation.split("&").map((value,index) =>   {   locationNbr++;
                                                                                                })
                    
                                        ymax = y + (Math.max(commentsHistoryNbr,locationNbr))*0.3 + 0.1
                                        if (ymax>=yPageMax) {
                                            pageNum++;
                                            y=startY+0.1;
                                            ymax = y + (Math.max(commentsHistoryNbr,locationNbr))*0.3 + 0.1
                                            _self4.createNewPDFPageAndHeader(pageNum);
                                            _self4.doc.setFontSize(9);
                                            _self4.doc.setTextColor(0);
                                            _self4.doc.setDrawColor(0);					
                                        }
                                        y=y+0.3;
                                        _self4.doc.text(1.2,y,""+wineItem.annee);
                                        _self4.doc.text(3,y,wineItem.nom);
                                        _self4.doc.text(11,y,wineItem.appellation.courte);
                                        _self4.doc.text(13.3,y,""+wineItem.prixAchat);
                                        _self4.doc.text(15.5,y,""+wineItem.nbreBouteillesReste);
                                        //Display Localisation on multiple lines if needed
                                        ytemp = y;
                                        c = 0;
                                        wineItem.localisation.split("&").map((value,index) =>   {   ytemp = y+ c * 0.3;
                                                                                                    _self4.doc.text(17,ytemp,value.trim());
                                                                                                    c++;
                                                                                                });
                                        //_self4.doc.text(17,y,wineItem.localisation);
                                        //Display either a remarque (old style)
                                        wineItem.remarque?_self4.doc.text(18.5,y,wineItem.remarque):_self4.doc.text(18.5,y,"");
                                        //... or a new remark created based on history ... on multiple lines
                                        ytemp = y;
                                        c = 0;
                                        if (wineItem.history)
                                            wineItem.history.map( (value,index) => { if (value.comment && value.type=="comment" && value.comment.trim()!="") {
                                                                                        ytemp = y + c * 0.3; 
                                                                                        _self4.doc.text(18.5,ytemp,value.date.slice(0,10)+": "+value.comment);
                                                                                        c++;
                                                                                     }
                                                                                    });
                                        //y=y+0.1;
                                        y = ymax;
                                        _self4.doc.setLineWidth(0.02);
                                        _self4.doc.rect(1,y,28,0.0,"DF");
                                    }                                
                                })
                            })                        
                        }
                    })
            });
            /* after type level */		
			_self.doc.setFontSize(14);
			_self.doc.setTextColor(0);
			_self.doc.setDrawColor(0);					
			if (y+1.2>=yPageMax) {
				pageNum++;
				y=startY;
				_self.createNewPDFPageAndHeader(pageNum);
			}
    		_self.doc.save('Contenu cave.pdf');
            console.log("after pdf generation");
		});
    }
        
	
	createNewPDFPageAndHeader(pgNum) {
		if (pgNum>1) {
			this.doc.addPage();
		}
		// adding header
		this.doc.setFontSize(18);
		this.doc.setFontStyle('normal');
//		doc.setFont("Verdana");
        let reportDate = new Date();
		this.doc.text(12, 0.7, "Contenu cave le "+reportDate.toLocaleDateString('fr-FR'));
		this.doc.setLineWidth(0.05);
		this.doc.setDrawColor(50);
		this.doc.setFillColor(100);
		this.doc.rect(1,1.3,28,1,"DF");
		this.doc.setFontSize(12);
		this.doc.setTextColor(255);
		this.doc.setFontStyle('bold');
		this.doc.text(1.2,1.9,"Année");
		this.doc.text(3,1.9,"Nom");
		this.doc.text(10,1.9,"Appellation");
		this.doc.text(12.7,1.9,"Prix achat");
		this.doc.text(15,1.9,"Reste");
		this.doc.text(16.7,1.65,"Loc.");
		this.doc.text(16.7,2.1,"G/D.y.x");
		this.doc.text(18.6,1.9,"Commentaire");
		
		// adding footer
		this.doc.setLineWidth(0.05);
		this.doc.setDrawColor(50);
		this.doc.setFillColor(100);
		this.doc.rect(1,20,28,0.0,"DF");
		this.doc.setFontSize(9);
		this.doc.setFontStyle('normal');
		this.doc.setTextColor(0);
//		doc.setFont("Verdana");
		this.doc.text(1, 20.3, reportDate.toLocaleDateString('fr-FR'));
		this.doc.text(27, 20.3, "page"+pgNum);
	}

    historyAsString(wine) {
        let historyString = "";
        wine.history.map(value => {if (value.comment) historyString = historyString+value.date.slice(0,10)+": "+value.comment+ " | "});
        historyString = historyString.slice(0,historyString.length-2);
        return historyString
    }


}
