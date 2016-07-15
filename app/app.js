import {inject} from 'aurelia-framework';
import {RapportPDF} from './services/rapportPDF';

@inject(RapportPDF)
export class App {
    constructor(rapportPDFservice){
       this.rapportPDFService = rapportPDFservice;
    }
    
    configureRouter(config, router) {
        config.title = 'wineCellar App Config';
        config.map([
            {
                route: ['todos'],
                name: 'todos',
                moduleId: 'pages/list-todos/list-todos',
                nav: true,
                title: 'todos'
            }, {
                route: ['todo', 'todo/:id'],
                name: 'todo',
                moduleId: 'pages/todo/todo',
                nav: true,
                title: 'View Todo',
            } ,  {
                route: ['', 'search'],
                name: 'search',
                moduleId: 'pages/searchVin/searchVin',
                nav: true,
                title: 'View Search Vin',
            } ,  {
                route: ['vin', 'vin/:id'],
                name: 'vin',
                moduleId: 'pages/vin/vin',
                nav: true,
                title: 'View vin',
            }, {
                route: ['config'],
                name: 'config',
                moduleId: 'pages/configuration/config',
                nav: true,
                title: 'Configuration',
            } , {
                route: ['test'],
                name: 'test',
                moduleId: 'pages/test/test',
                nav: true,
                title: 'test',
            } , {
                route: ['rapport'],
                name: 'rapport',
                moduleId: 'pages/rapport/rapport',
                nav: true,
                title: 'rapport',
            } , {
                route: ['listAppellations'],
                name: 'listAppellations',
                moduleId: 'pages/list-appellations/list-appellations',
                nav: true,
                title: 'Liste Appellation',
            } , {
                route: ['appellation'],
                name: 'appellation',
                moduleId: 'pages/appellation/appellation',
                nav: true,
                title: 'Appellation',
            } , {
                route: ['listOrigines'],
                name: 'listOrigines',
                moduleId: 'pages/origin/list-origines',
                nav: true,
                title: 'Liste Origines',
            } , {
                route: ['origine'],
                name: 'origine',
                moduleId: 'pages/origin/origin',
                nav: true,
                title: 'Origine',
            }
        ]);

        this.router = router;
    }
    
   goBack() {
      history.back();
   }
	
   goForward(){
      history.forward();
   }
   
   createPDF(){
       this.rapportPDFService.cellarToPDF();
   }

}
