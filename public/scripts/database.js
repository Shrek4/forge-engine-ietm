async function showPartDescription(id) {
    $.get( "http://localhost:3000/parts", function( data ) {
      if(animationLoaded) $( "#partdesc" ).html( data[id-1].description ); else $( "#partdesc" ).html( data[id].description );
    });
}

async function showEngineDescription() {
    $.get( "http://localhost:3000/parts", function( data ) {
      $( "#info" ).html( data[0].description );
    });
}
