var sortable = $('sortable');


var drake = dragula([sortable]);

function $ (id) {
    return document.getElementById(id);
  }

  drake.on('drop', function(el, target, source, sibling) {
    //console.log(el, target, source, sibling);
    
  });