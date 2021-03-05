async function showPartDescription(id) {
    $.get( "http://localhost:3000/parts", function( data ) {
      $( "#partdesc" ).html( data[id].description );
<<<<<<< HEAD
      //console.log( data );
=======
>>>>>>> b24a0be4f5250e64d7c4f34bac0fb4f2ee34161a
    });
}

async function showEngineDescription() {
<<<<<<< HEAD
    $.get( "http://localhost:3000/parts", function( data ) {
      $( "#info" ).html( data[0].description );
    });
=======
  $.get( "http://localhost:3000/parts", function( data ) {
    $( "#info" ).html( data[0].description );
  });
>>>>>>> b24a0be4f5250e64d7c4f34bac0fb4f2ee34161a
}
