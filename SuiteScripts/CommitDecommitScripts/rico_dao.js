RICO_DAO = (function() {
	return {
		commit : {
			setting : 'custscript_sc_ids',
			listId : 1
		},
		decommit : {
			setting : 'custscript_sd_ids',
			listId : 3
		},
		complete : {
			setting : 'custscript_sq_ids',
			listId : 2
		},
		update : function(id, type, lines) {
		
			nlapiLogExecution('DEBUG', 'f3_logs', 'executing salesorder number: ' + id);
			nlapiLogExecution('DEBUG', 'f3_logs', 'executing salesorder lines count: ' + lines.length);
		
			var soRec = nlapiLoadRecord('salesorder', id);
			
			for(var i = 0; i < lines.length; i++){
				var lineIndex = soRec.findLineItemValue('item', 'line', lines[i]);
				soRec.setLineItemValue('item', 'commitinventory', lineIndex, this[type].listId);
			}
			
			nlapiSubmitRecord(soRec, true, true);
		},
		getSavedSearchIds : function(id) {
			var ctx, idStr;
			var idsArr = new Array();
			ctx = nlapiGetContext();
			idStr = ctx.getSetting('SCRIPT', this[id].setting);
			nlapiLogExecution('DEBUG', 'saved search ids', idStr);
			if (isValidValue(idStr)) {
				var tempIds = idStr.split(',');
				tempIds.forEach(function(id) {
					if (!isNaN(id) && isValidValue(id))
						idsArr.push(id);
				});
			}
			return idsArr;
		},
		orderUpdate : function(id) {
			
			try{
			
				nlapiLogExecution('DEBUG', 'f3_logs', 'SCH script started');
				
				var ctx = nlapiGetContext();

				var savedSearchIdsArr = this.getSavedSearchIds(id);

				if(savedSearchIdsArr.length) {
					nlapiLogExecution('DEBUG', 'f3_logs', 'saved searches found: ' + savedSearchIdsArr.length);
				}
				
				for ( var i in savedSearchIdsArr) {
				
					nlapiLogExecution('DEBUG', 'saved search id', savedSearchIdsArr[i]);
					
					try {
						var orders = nlapiSearchRecord('transaction', savedSearchIdsArr[i], null, [new nlobjSearchColumn('item'), new nlobjSearchColumn('commit') , new nlobjSearchColumn('line')]);
					} catch (e) {
						nlapiLogExecution('ERROR', 'Invalid saved search id');
						continue;
					}
					
					/*********************************************************************************************/
					var ordersData = [];
					
					if (orders != null) {
					
						nlapiLogExecution('DEBUG', 'f3_logs', 'sales orders found: ' + orders.length);
					
						nlapiLogExecution('DEBUG', 'f3_logs', 'ordersData parsing started');
					
						for ( var j = 0; j < orders.length; j++) {
							
							var orderId = orders[j].getId();
							if(!ordersData[orderId] && typeof ordersData[orderId] == 'undefined'){
								ordersData[orderId] = [];
							}
							
							//var line = orders[j].getValue('line');
							ordersData[orderId].push(orders[j].getValue('line'));	
						}
						
						nlapiLogExecution('DEBUG', 'f3_logs', 'ordersData parsing ended');
						
						var ordersDataLength = Object.keys(ordersData).length;
						nlapiLogExecution('DEBUG', 'f3_logs', 'aggreagated sales orders found: ' + ordersDataLength);
						
						for (var orderId in ordersData) {
							if (ordersData.hasOwnProperty(orderId)) {
							
								try {
									// commit sales order
									this.update(orderId, id, ordersData[orderId]);
									nlapiLogExecution('DEBUG', 'Order Committed', 'Id: ' + orderId);
								} catch (ex) {
									nlapiLogExecution('ERROR', 'Error in commiting sales order id: ' + orderId, ex.message);
								}
								
								nlapiLogExecution('DEBUG', 'f3_logs', 'salesorder treating: ' + orderId + ' of ' + ordersDataLength);
								nlapiLogExecution('DEBUG', 'f3_logs', 'usage remaining: ' + ctx.getRemainingUsage());
								
								if (ctx.getRemainingUsage() < 100) {
									nlapiLogExecution('DEBUG', 'f3_logs', 'usage remaining at rescheduling: ' + ctx.getRemainingUsage());
									nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId());
									return;
								}
							}
						}
						
					}
					
					
					
					
					/*********************************************************************************************/
					
				}
			}
			catch(ex){
				nlapiLogExecution('DEBUG', 'f3_logs', 'Errror Occurred: ' + ex.message);
			}
		}
	};
})();
var isValidValue = function(value) {
	return !(value == '' || value == null || typeof value == 'undefined');
};
