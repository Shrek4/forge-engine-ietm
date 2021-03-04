async function showPartDescription(id) {
    $.get( "http://localhost:3000/parts", function( data ) {
      $( "#info" ).html( data[id].description );
      //console.log( data );
    });
}
