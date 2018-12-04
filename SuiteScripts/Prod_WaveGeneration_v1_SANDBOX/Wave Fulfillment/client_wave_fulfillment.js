var css = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.4/css/bootstrap.min.css" integrity="sha384-2hfp1SzUoho7/TsGGGDaFdsuuDL0LX2hnUp6VkX3CUQ2K4K+xjboZdsXyp4oUHZj" crossorigin="anonymous">' +
"<style> #overlay { position:  absolute; top: 0; left: 0;  width: 100%; height: 100%; background-color: #000; filter:alpha(opacity=50);  -moz-opacity:0.5; -khtml-opacity: 0.5; opacity: 0.5; z-index: 10000;} </style> " ;

var d = document.createElement('div'); d.innerHTML = css; document.body.appendChild(d);

jQuery( document ).ready(function() { 
        jQuery("#custpage_fulfillwave").on("click", function(){

        var overlay = jQuery('<div id="overlay" style="text-align:center"> <img src="https://system.na3.netsuite.com/core/media/media.nl?id=6131728&c=3500213&h=1c8907181eecbe4158ef" height="40%" width="20%" /> </div>');
    	jQuery('body').append(overlay);  

        

        
         jQuery(this).prop("disabled", true);}
    ); 
});


