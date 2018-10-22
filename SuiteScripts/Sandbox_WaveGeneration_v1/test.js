var chuckedData = _.chunk(itemJSON, 40); 
          
for (var i = 0; i < chuckedData.length; i++) {
                   
    //chuckedData[i];   
    var data = JSON.stringify(chuckedData[i]);
    
    nlapiLogExecution('DEBUG', 'entering chuncked data', 'test');
    
      var url = 'https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=434&deploy=1&compid=3500213&h=887785dfb750fa6721fa';
      url += '&orders=' + encodeURIComponent(checkbox.orders);	
      url += '&waveid=' + encodeURIComponent(wave_rec_id);	
      url += '&user=' + encodeURIComponent(checkbox.user);	
      url += '&itemjson=' + encodeURIComponent(data);
      nlapiRequestURL(url); 		           	

   }  