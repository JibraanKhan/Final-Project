var rowConverter = function(data){
  return {
    Rank:parseInt(data.Rank),
    Name:data.Name,
    Platform:data.Platform,
    Year:data.Year,
    Genre:data.Genre,
    Publisher:data.Publisher,
    NA_Sales:parseFloat(data.NA_Sales),
    EU_Sales:parseFloat(data.EU_Sales),
    JP_Sales:parseFloat(data.JP_Sales),
    Other_Sales:parseFloat(data.Other_Sales),
    Global_Sales:parseFloat(data.Global_Sales),
  };
}
var data = d3.csv('vgsales.csv', rowConverter)
var other_data = d3.csv('PopulationPerCountry.csv') // https://github.com/datasets/population/edit/master/data/population.csv
Promise.all([data, other_data]).then(function(values){
  var sales_data = values[0];
  var population_data = values[1];
  var us_recessions = [
    ['Jan 1980 – July 1980', [1980.083, 1980.583]],
    ['July 1981 – Nov 1982', [1981.583, 1982.917]],
    ['July 1990 – Mar 1991', [1990.583, 1991.25]],
    ['Mar 2001 – Nov 2001', [2001.25, 2001.917]],
    ['Dec 2007 – June 2009', [2008, 2009.5]],
  ]
  var eu_recessions = [ // https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?end=2017&locations=EU-US-CN&start=1980
    ['1980 - 1981', [1980, 1981]],
    ['1988 - 1993', [1988, 1993]],
    ['1994 - 1996', [1994, 1996]],
    ['2000 - 2003', [2000, 2003]],
    ['2004 - 2005', [2004, 2005]],
    ['2006 - 2009', [2006, 2009]],
    ['2010 - 2012', [2010, 2012]],
    ['2015 - 2016', [2015, 2016]],
  ]
  var jpn_recessions = [ // https://fred.stlouisfed.org/series/JPNRECP
    ['Jan 1980 - May 1980', [1980.083, 1980.417]],
    ['Mar 1982 - May 1983', [1982.25, 1983.417]],
    ['Sep 1985 - Feb 1987', [1985.75, 1987.167]],
    ['Aug 1990 - Oct 1994', [1990.667, 1994.833]],
    ['Jan 1997 - May 1999', [1997.083, 1999.417]],
    ['Jan 2001 - Jan 2002', [2001.083, 2002.083]],
    ['Mar 2004 - Dec 2004', [2004.25, 2005]],
    ['Feb 2008 - Apr 2009', [2008.167, 2009.333]],
    ['Aug 2010 - Sep 2012', [2010.667, 2012.75]],
    ['Oct 2013 - Aug 2016', [2013.833, 2016.667]],
    ['Oct 2017 - Jan 2019', [2017.833, 2019.083]],
  ]
  var populations = {
    ['Japan']: {},
    ['European Union']: {},
    ['North America']:{},
  }
  population_data.forEach(function(data, index){
    if ((populations[data['Country Name']]) && (data.Year >= 1980) && (data.Year <= 2020)){
      populations[data['Country Name']][data.Year] = data.Value;
    }
  })
  var years = [];
  var min_year;
  var max_year;
  var span = 1;
  sales_data.forEach(function(game, index){
      if (index == 0){
        min_year = game.Year;
        max_year = game.Year;
      }else{
        min_year = Math.min(game.Year, min_year) || min_year;
        max_year = Math.max(game.Year, max_year) || max_year;
    }
  })
  for (var i = min_year; i <= max_year; i += span){
    years.push(i);
  }
  var data_sorted = sort_data(sales_data, us_recessions, eu_recessions, jpn_recessions, populations, years);


  var svg_screen = {
    width: 3000,
    height: 500
  }
  var graph_screen = {
    width: 2000,
    height: 400
  }
  var svg_margins = {
    left: svg_screen.width * 0.01,
    right: svg_screen.width * 0.2,
    top: svg_screen.height * 0.01,
    bottom: svg_screen.height * 0.01
  }
  var graph_margins = {
    left: graph_screen.width * 0.025,
    top: graph_screen.height * 0.2,
    bottom: graph_screen.height * 0.05,
    right: graph_screen.width * 0.2,
  }
  var svg = d3.select('body')
              .append('svg')
              .attr('width', svg_screen.width)
              .attr('height', svg_screen.height);
  var curr_region = '';
  var svg_width = svg_screen.width - svg_margins.left - svg_margins.right
  var svg_height = svg_screen.height - svg_margins.bottom - svg_margins.top
  var graph_width = graph_screen.width - graph_margins.left - graph_margins.right;
  var graph_height = graph_screen.height - graph_margins.top - graph_margins.bottom;
  var domain_constructor = function(){
    var arr_to_return = [];

    years.forEach(function(d, i){
      arr_to_return.push(d.toString())
    })

    return arr_to_return;
  }
  var range_constructor = function(){
    var arr_to_return = [];

    years.forEach(function(d, i){
      arr_to_return.push(graph_width * ((i + 1)/years.length) + graph_margins.left);
    })

    return arr_to_return;
  }
  console.log("Production:", data_sorted.Production);
  var graph = svg.append('g')
                 .attr('translate', 'transform(' + (graph_margins.left + svg_margins.left) + ',' + (graph_margins.top + svg_margins.top) + ')')
  var xScale = d3.scaleQuantile()
                 .domain(domain_constructor())
                 .range(range_constructor())
 // var xAxis = d3.axisTop(xAxisScale)
 //               .ticks(d3.max(d3.max(student_buckets, function(d, i){ return d.map(function(d,i){ return d.max_day; }); }))/stretch)
  var xAxis = d3.axisTop(xScale)
                .ticks(2)
  // console.log("Range:", [Math.min(Math.min(d3.min(Object.values(data_sorted.SalesPerCapita.Japan)), d3.min(Object.values(data_sorted.SalesPerCapita.Europe))), d3.min(Object.values(data_sorted.SalesPerCapita['North America']))), Math.max(Math.max(d3.max(Object.values(data_sorted.SalesPerCapita.Japan)), d3.max(Object.values(data_sorted.SalesPerCapita.Europe))), d3.max(Object.values(data_sorted.SalesPerCapita['North America'])))])
  var yScale_S = d3.scaleLinear()
                   .domain([Math.min(Math.min(d3.min(Object.values(data_sorted.SalesPerCapita.Japan)), d3.min(Object.values(data_sorted.SalesPerCapita.Europe))), d3.min(Object.values(data_sorted.SalesPerCapita['North America']))), Math.max(Math.max(d3.max(Object.values(data_sorted.SalesPerCapita.Japan)), d3.max(Object.values(data_sorted.SalesPerCapita.Europe))), d3.max(Object.values(data_sorted.SalesPerCapita['North America'])))])
                   .range([graph_height, 0])
  var yAxis_S = d3.axisRight(yScale_S)
                  .ticks(data_sorted.SalesPerCapita.Japan.length)
  var yScale_P = d3.scaleLinear()
                   .domain([d3.min(Object.values(data_sorted.Production)), d3.max(Object.values(data_sorted.Production))])
                   .range([graph_height, svg_margins.top + graph_margins.top])
  var yAxis_P = d3.axisLeft(yScale_P)
                  .ticks(data_sorted.Production.length);
  var max;
  var type_of_line = {
    ['North America']: '3, 3',
    ['Europe']: '20, 15',
    ['Japan']: '0, 0'
  }
  var drawLine = d3.line()
                   .x(function(d, i){ return xScale(Object.keys(data_sorted.SalesPerCapita[region])[i])})
                   .y(function(d, i){ return yScale_S(d) + graph_margins.top - graph_margins.bottom})
  var drawArea = d3.area()
                    // .curve(d3.curveCatmullRom.alpha(0))
                    .x(function(d, i){ return xScale(Object.keys(data_sorted.Production)[i]); })
                    .y0(yScale_P.range()[0] + (graph_margins.top - graph_margins.bottom))
                    .y1(function(d, i){ return (yScale_P(d) + (graph_margins.top - graph_margins.bottom)); })
  var area_graph = graph.append('path')
                        .datum(Object.values(data_sorted.Production))
                        .attr('d', drawArea)
                        .attr('fill', 'blue')
                        .attr('opacity', 0.5)
  var colors = {
    ['North America']: '#e85fde',
    ['Europe']: '#e89933',
    ['Japan']: '#42f445'
  }
  for (var region in data_sorted.SalesPerCapita){
    if (data_sorted.SalesPerCapita.hasOwnProperty(region)){
      curr_region = region;
      var line_graph = graph.append('path')
                            .datum(Object.values(data_sorted.SalesPerCapita[region]))
                            .attr('d', drawLine)
                            .attr('fill', 'none')
                            .attr('stroke', colors[region])
                            .attr('stroke-width', 5)
                            .attr('stroke-dasharray', (type_of_line[region]))
                            .attr('class', type_of_line[region])
    }
  }

  svg.append('g')
     .attr('transform', 'translate(' + (0) +',' + (graph_height + graph_margins.top + graph_margins.bottom) + ')')
     .call(xAxis);
  svg.append('g')
     .attr('transform', 'translate(' + svg_margins.left + ',' + (graph_margins.top - graph_margins.bottom) + ')')
     .call(yAxis_S);
  svg.append('g')
     .attr('transform', 'translate(' + (svg_margins.left + graph_width) + ',' + (graph_margins.top - graph_margins.bottom) + ')')
     .call(yAxis_P);
  var recession_years = function(){
    var recs = []
    for (var region in data_sorted.Recessions){
      if (data_sorted.Recessions.hasOwnProperty(region)){
        data_sorted.Recessions[region].forEach(function(recession_obj){
          recs.push(recession_obj[1][0], recession_obj[1][1]);
        })
      }
    }
    return recs;
  }();
  var recession_bars = svg.append('g')

  var recessions = recession_bars.selectAll('g')
                      .data(Object.values(data_sorted.Recessions))
                      .enter()
                      .append('g')
                      .each(function(d_obj, i){
                        var current_g = d3.select(this);
                        var padding = 0.4;
                        var recession_holder = current_g.append('g')
                                            .attr('transform', 'translate(' + -svg_margins.left + ',' + 0 + ')')
                        var text = current_g.append('text')
                                            .attr('x', 0)
                                            .attr('y', (((graph_margins.top * 0.5)/(Object.values(data_sorted.Recessions).length)) - (((graph_margins.top * 0.5)/(Object.values(data_sorted.Recessions).length)) * padding)) * 1)
                                            .text(Object.keys(data_sorted.Recessions)[i]);
                        recession_holder.selectAll('rect')
                                 .data(d_obj)
                                 .enter()
                                 .append('rect')
                                 .attr('x', function(d, i){
                                   return xScale(d[1][0])
                                 })
                                 .attr('y', 0)
                                 .attr('fill', 'red')
                                 .attr('width', function(d, i){
                                   return xScale(d[1][1]) - xScale(d[1][0]);
                                 })
                                 .attr('height', ((graph_margins.top * 0.5)/(Object.values(data_sorted.Recessions).length)) - (((graph_margins.top * 0.5)/(Object.values(data_sorted.Recessions).length)) * padding));
                      })
                      .attr('transform', function(d, i){
                        return 'translate(' + svg_margins.left + ',' + ((i + 1) * ((graph_margins.top * 0.5)/(Object.values(data_sorted.Recessions).length))) + ')'
                      })
}, function(error){
  console.log(error);
})








































var sort_data = function(sales_data, us, eu, jpn, populations, years){
  var returningdata = {
    ['SalesPerCapita']: {['Japan']: {},
                          ['Europe']: {},
                          ['North America']:{}
                        },
    ['Production']: {},
    ['Recessions']: {},
  }
  var salespercapita = {
    ['Japan']: {},
    ['Europe']: {},
    ['North America']:{},
  }
  var production = {
  }
  var recessions = {
    ['Japan']: jpn,
    ['Europe']: eu,
    ['North America']: us
  }
  var property_converter = {
    ['Japan']: 'JP_Sales',
    ['Europe']: 'EU_Sales',
    ['North America']: 'NA_Sales',
  }
  var population_prop_converter = {
    ['Japan']: 'Japan',
    ['Europe']: 'European Union',
    ['North America']: 'North America',
  }
  for (var region in salespercapita){
    if (salespercapita.hasOwnProperty(region)){
      var dict = salespercapita[region];
      years.forEach(function(year, index){
        dict[year] = 0;
      })
    }
  }
  for (var region in salespercapita){
    if (salespercapita.hasOwnProperty(region)){
      for (var year in salespercapita[region]){
        if (salespercapita[region].hasOwnProperty(year)){
          var population = populations[population_prop_converter[region]][year];
          var capita_total = 0;
          sales_data.forEach(function(game, index){
            if (game.Year == year){
              var prop = property_converter[region];
              capita_total += game[prop]/population;
            }
          })
          salespercapita[region][year] = capita_total || 0;
        }
      }
    }
  }
  years.forEach(function(year){
    var production_value = 0;
    sales_data.forEach(function(game){
      if (game.Year == year){
        production_value++;
      }
    })
    production[year] = production_value;
  })
  returningdata.SalesPerCapita = salespercapita;
  returningdata.Production = production;
  returningdata.Recessions = recessions;
  return returningdata;
}
