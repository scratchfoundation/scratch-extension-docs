/* Extension using Worldcup data */
/* JSON data http://worldcup.sfg.io */
/* by Tiago Maluta (@maluta) <tiago.maluta@gmail.com>, Jun 2014 */

new (function() {
    var ext = this;

    ext._shutdown = function() {};

    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.get_group = function(country, callback) {

        $.ajax({
              url: 'http://worldcup.sfg.io/teams/results',
              dataType: 'jsonp',
              success: function( teams ) {
                  // Got the data - parse it and return the fifa_code
                  for (var i=0; i<teams.length; i++) {
                    if (teams[i]['fifa_code'] == country) {
                      ret = teams[i]['group_letter'];
                    }
                  }
                  callback(ret);
              }
        });
    };

    ext.match_result = function( a, b, callback) {

        var code_a = descriptor.menus.codes[descriptor.menus.countries.indexOf(a)];
        var code_b = descriptor.menus.codes[descriptor.menus.countries.indexOf(b)];

        $.ajax({
              url: 'http://worldcup.sfg.io/matches/country?fifa_code=' + code_a,
              dataType: 'jsonp',
              success: function( matches ) {

                 for (var i=0;i<matches.length;i++) {

                    if ((matches[i].home_team.code === code_a) && (matches[i].away_team.code === code_b)) {
                          ret = matches[i].winner;
                    } else if ((matches[i].home_team.code === code_b) && (matches[i].away_team.code === code_a)) {
                          ret = matches[i].winner;
                    }
                    console.log(ret);
                    callback(ret);
                 }
               }
        });
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['R', 'group of %m.codes', 'get_group'],
            ['R', 'result of match %m.countries vs %m.countries', 'match_result'],
        ],
        menus: {
           countries:['Brazil', 'England', 'Uruguay', 'Italy', 'Costa Rica', 'Netherlands', 'Australia', 'Spain', 'Chile', 'Croatia', 'Cameroon', 'Mexico', 'Colombia', 'Ivory Coast', 'Greece', 'Japan', 'Iran', 'Argentina', 'Nigeria', 'Bosnia and Herzegovina', 'France', 'Switzerland', 'Ecuador', 'Honduras', 'Germany','Ghana', 'Portugal', 'USA', 'Belgium', 'Russia', 'Algeria', 'Korea Republic'],
           codes:['BRA','ENG','URU','ITA','CRC','NED','AUS','ESP','CHI','CRO','CMR','MEX','COL','CIV','GRE','JPN','IRN','ARG','NGA','BIH','FRA','SUI','ECU','HON','GER','GHA','POR','USA','BEL','RUS','ALG','KOR']
        }};

    // Register the extension
    ScratchExtensions.register('World Cup', descriptor, ext);
})();
