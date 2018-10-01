/************************************************************************
* CLIENT BINDING extension for jTable                                           *
* Author: Oculus Dev                                           *
*************************************************************************/
(function($) {

    //Reference to base object members
    var base = {
        _createRecordLoadUrl: $.hik.jtable.prototype._createRecordLoadUrl,
        _reloadTable: $.hik.jtable.prototype._reloadTable
    };

    //extension members
    $.extend(true, $.hik.jtable.prototype, {

        /************************************************************************
        * DEFAULT OPTIONS / EVENTS                                              *
         *************************************************************************/
        options: {
        	clientBinding: false,
			clientData: null
        },

        /************************************************************************
        * PRIVATE FIELDS                                                        *
        *************************************************************************/
		//define client binding related future stuff here
		//Reference to the clientBinding 

		_$clientData: null,
        _$clientDataComplete: null,
        /************************************************************************
        * OVERRIDED METHODS                                                     *
        *************************************************************************/

    	/* Overrides _createRecordLoadUrl method create custom or Empty URL in client binding mode.
        *************************************************************************/
        _createRecordLoadUrl: function () {
        	if (this.options.clientBinding == true) {
        		this._$clientData = this.options.clientData;

        		return 'CUSTOM';
        	} else {
        		return base._createRecordLoadUrl.apply(this, arguments);
        	}
        },

        _clientReload: function() {
            var pageNum = this._currentPageNo;
            var pageSize = this.options.pageSize;
            //var dataAll = this._$clientDataComplete.Records;
            
            //this._$clientData = this._$clientDataComplete;
            var maxIndex = (pageNum * pageSize);
            this._$clientData.Records = this._$clientDataComplete.Records.slice(maxIndex-pageSize, maxIndex);
        },
        
    	/* Overrides _reloadTable method to re-load data for table.
        *************************************************************************/
        _reloadTable: function (completeCallback) {

        	if (this.options.clientBinding == false) {
        		return base._reloadTable.apply(this, arguments);
        	}
            else {
                this._clientReload();
            }

        	var self = this;

        	//Disable table since it's busy
        	self._showBusy(self.options.messages.loadingMessage, self.options.loadingAnimationDelay);

        	//Load data from server
        	self._onLoadingRecords();

        	//Re-generate table rows
        	self._removeAllRows('reloading');
            //HSN: Set clientData here
        	self._addRecordsToTable(this._$clientData.Records);
        	self._hideBusy();

        	self._onRecordsLoaded(this._$clientData);

        	//Call complete callback
        	if (completeCallback) {
        		completeCallback();
        	}

        	return null;
        },

		/************************************************************************
		* PUBLIC METHODS                                                       *
		*************************************************************************/

    	/* When in client side binding mode, use this method for loading jTable instead of simple load
		*************************************************************************/
        loadClient: function (clientData, completeCallback) {
        	this._currentPageNo = 1;
        	this._$clientData = this._clone(clientData);
            this._$clientDataComplete = this._clone(clientData);
        	this._reloadTable(completeCallback);
        },
		
        /************************************************************************
        * PRIVATE METHODS                                                       *
        *************************************************************************/        

		//write private functionaly here if any
        
        /* Clones the object into a new one
		*************************************************************************/
        _clone: function (obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }
        
    });

})(jQuery);
