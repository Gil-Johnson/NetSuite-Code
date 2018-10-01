function getImages (params){

       var name= params.getParameter('name');
nlapiLogExecution("ERROR","PARAM",name)
      if(name && name !=""){
	var filter = new nlobjSearchFilter('custitem_dl4ref', null, 'is', name);
	var searchresult = nlapiSearchRecord('inventoryitem', null, filter, null);
  if(searchresult){
    var record = nlapiLoadRecord('inventoryitem',searchresult[0].getId(),{recordmode: 'dynamic'});
     response.write(record.getFieldValue('custitemthumbnail_image'));
  }else{
    searchresult =nlapiSearchRecord('kititem',null,filter,null);
    if(searchresult){
      var record = nlapiLoadRecord('inventoryitem',searchresult[0].getId(),{recordmode: 'dynamic'});
      response.write(record.getFieldValue('custitemthumbnail_image'));
    }else{
       searchresult =nlapiSearchRecord('noninventoryitem',null,filter,null);
       if(searchresult){
          var record = nlapiLoadRecord('noninventoryitem',searchresult[0].getId(),{recordmode: 'dynamic'});
          response.write(record.getFieldValue('custitemthumbnail_image'));
       }else{
          searchresult =nlapiSearchRecord('assemblyitem',null,filter,null);
          if(searchresult){
            var record = nlapiLoadRecord('assemblyitem',searchresult[0].getId(),{recordmode: 'dynamic'});
nlapiLogExecution("ERROR","PARAM1",record.getFieldValue('custitemthumbnail_image'))
           response.write(record.getFieldValue('custitemthumbnail_image'));
          }
       }
    }
  }
}
}
