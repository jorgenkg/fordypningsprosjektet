var weightedSelect = function( arrayOfWeightedOptions ){
  var total = _.sum( arrayOfWeightedOptions, 
                     function( obj ){
                       return obj[0];
              });
  var upto = 0, 
      chosen = null,
      bounds = Math.random() * total;
  
  for( var i = 0; i < arrayOfWeightedOptions.length; i++){
    upto += arrayOfWeightedOptions[i][0];
    if( upto >= bounds ){
      chosen = arrayOfWeightedOptions[i][1];
    }
  }
  
  return chosen;
};