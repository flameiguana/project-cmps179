var usEbayCategoryListByName = [];
for(var j in usEbayCategoryList)
{
	usEbayCategoryListByName.push(
		usEbayCategoryList[j]['n']
	);
}
	 $(function() {
		$( "#tags" ).autocomplete({
	      source: usEbayCategoryListByName,
  	      select: function(e, ui) { 
  	      	makeEbayRequest(getIdByCategoryName(ui.item.value))
  	      	}
	    });
	  });
	  
//finds the id by the name
function getIdByCategoryName(categoryName){
	for(var j in usEbayCategoryList)
	{
		if(usEbayCategoryList[j]['n'] == categoryName)
		{
			return usEbayCategoryList[j]['p'];
		}
	}
}

//returns whether the given thing is an integer
function isInt(n) {
   return typeof n === 'number' && n % 1 == 0;
}
