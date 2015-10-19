var weightedSelect = function( arrayOfWeightedOptions ){
  var upto = 0, 
      chosen = null,
      bounds = Math.random();
  
  for( var i = 0; i < arrayOfWeightedOptions.length; i++){
    upto += arrayOfWeightedOptions[i][0];
    if( upto >= bounds ){
      return arrayOfWeightedOptions[i][1];
    }
  }
};