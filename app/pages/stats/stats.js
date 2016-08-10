import {inject} from 'aurelia-framework';
import * as d3 from 'd3';
import { Pouch } from '../../services/pouch';
import {EventAggregator} from 'aurelia-event-aggregator';
import {I18N,BaseI18N} from 'aurelia-i18n';

@inject(Pouch,d3,I18N,Element,EventAggregator)
export class Stats extends BaseI18N {

    vins = [];
    dataset = [];

  constructor (pouch,d3,i18n,element,eventAggregator) {
    super(i18n,element,eventAggregator);
    this.pouch = pouch;
    this.d3       = d3;
    this.eventAggregator = eventAggregator;
    this.i18n = i18n;
    this.element = element;   
    this.fromOptions=[{value:1,display:this.i18n.tr('oneYear',this.i18n.getLocale())},
                {value:2,display:this.i18n.tr('twoYears')},
                {value:3,display:this.i18n.tr('threeYears')}];   
    this.toOptions=[{value:0,display:this.i18n.tr('now')},
                {value:1,display:this.i18n.tr('oneYear')},
                {value:2,display:this.i18n.tr('twoYears')},
                {value:3,display:this.i18n.tr('threeYears')}];   
    this.start = 1;
    this.end = 0;
  }

  attached () {
    super.attached();
  }
  
  draw() {
    var _self = this;
      return _self.pouch.getVins().then(vins => {
            _self.vins = vins.map(v => v.doc);
            _self.fetchData();
            this.initializeChart();
        });      
  }
  
  fetchData() {
     let currentDate = new Date();
     this.total = 0;
     this.dataset = [];
     var _self = this;
     this.vins.forEach(function(item,index){
         if (typeof(item.history) != 'undefined' && item.history.length > 0){
           var _self1 = _self;
           item.history.forEach(function(h,ih) {
             let into = false;
             if (h&&h.type=="update" &&
                (Date.parse(h.date) <= currentDate-(_self.end*365*1000*3600*24) && 
                Date.parse(h.date) > currentDate-(_self.start*365*1000*3600*24))) {
                // if dataset already contains the region, add the difference to dataset's count. If not, create dataset element with label and count
                var _self2 = _self1;
                _self.dataset.forEach(function(d,id) {
                    if (d.label == item.origine.region) {
                        d.count = d.count - h.difference;
                        _self2.total = _self2.total - h.difference
                        into = true;
                    }
                });
                if (!into) {
                    _self.dataset.push({label:item.origine.region,count:-h.difference});
                    _self2.total = _self2.total - h.difference;
                }
             }
           });
         }
     });
  }

  initializeChart () {
    this.margin = {
      top:    20,
      right:  20,
      bottom: 30,
      left:   50
    };
    this.width  = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.renderDonut();
  }

  renderDonut() {
/*              var dataset = [
          { label: 'Abulia', count: 10 },
          { label: 'Betelgeuse', count: 20 },
          { label: 'Cantaloupe', count: 30 },
          { label: 'Dijkstra', count: 40 }
        ];
*/        var width = 360;
        var height = 360;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 75;                            // NEW
        var legendRectSize = 18;                                  // NEW
        var legendSpacing = 4;                                    // NEW
        var color = d3.scaleOrdinal(d3.schemeCategory20b);

        //cleaning up before drawing
        var title = d3.select('#title');
        title.html('');
        var svg = d3.select('#chart');
        svg.html('');
        
        title = d3.select('#title')
            .append('h3')
            .html("total : &nbsp;"+this.total);
        svg = d3.select('#chart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');
        var arc = d3.arc()
          .innerRadius(radius - donutWidth)             // UPDATED
          .outerRadius(radius);
        var pie = d3.pie()
          .value(function(d) { return d.count; })
          .sort(null);
        var tooltip = d3.select('#chart')                               // NEW
          .append('div')                                                // NEW
          .attr('class', 'tooltip');                                    // NEW
        tooltip.append('div')                                           // NEW
          .attr('class', 'label');                                      // NEW
        tooltip.append('div')                                           // NEW
          .attr('class', 'count');                                      // NEW
        tooltip.append('div')                                           // NEW
          .attr('class', 'percent');                                    // NEW
       var path = svg.selectAll('path')
          .data(pie(this.dataset))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) {
            return color(d.data.label);
          });
        var _self = this;
        path.on('mouseover', function(d) {                            // NEW
        var total = d3.sum(_self.dataset.map(function(d) {                // NEW
            return d.count;                                           // NEW
        }));                                                        // NEW
        var percent = Math.round(1000 * d.data.count / total) / 10; // NEW
        tooltip.select('.label').html(d.data.label);                // NEW
        tooltip.select('.count').html(d.data.count);                // NEW
        tooltip.select('.percent').html(percent + '%');             // NEW
        tooltip.style('display', 'block');                          // NEW
        });                                                           // NEW
        path.on('mouseout', function() {                              // NEW
        tooltip.style('display', 'none');                           // NEW
        });                                                           // NEW
        /* OPTIONAL
        path.on('mousemove', function(d) {                            // NEW
        tooltip.style('top', (d3.event.layerY + 10) + 'px')         // NEW
            .style('left', (d3.event.layerX + 10) + 'px');            // NEW
        });                                                           // NEW
        */
        var legend = svg.selectAll('.legend')                     // NEW
          .data(color.domain())                                   // NEW
          .enter()                                                // NEW
          .append('g')                                            // NEW
          .attr('class', 'legend')                                // NEW
          .attr('transform', function(d, i) {                     // NEW
            var height = legendRectSize + legendSpacing;          // NEW
            var offset =  height * color.domain().length / 2;     // NEW
            var horz = -2 * legendRectSize;                       // NEW
            var vert = i * height - offset;                       // NEW
            return 'translate(' + horz + ',' + vert + ')';        // NEW
          });                                                     // NEW
        legend.append('rect')                                     // NEW
          .attr('width', legendRectSize)                          // NEW
          .attr('height', legendRectSize)                         // NEW
          .style('fill', color)                                   // NEW
          .style('stroke', color);                                // NEW
        legend.append('text')                                     // NEW
          .attr('x', legendRectSize + legendSpacing)              // NEW
          .attr('y', legendRectSize - legendSpacing)              // NEW
          .text(function(d) { return d; });                       // NEW
  }
  
}