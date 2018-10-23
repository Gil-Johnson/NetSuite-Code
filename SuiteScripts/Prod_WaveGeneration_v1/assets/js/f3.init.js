/**
 * Created by zshaikh on 8/28/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */



/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */



$(document).ready(function () {



    /**
     * GridManagerFactory class to create
     * factory of specified grid manager via type paramter
     */
    var UIManagerFactory = {

        /**
         * getGridManager method to get
         * instance of newly created factory by specified type
         * @param type {String} specify the type of factory you want
         */
        createUIManager: function (type) {
            if (type === 'OrderReview') {
                return new OrderReviewUIManager(type);
            }
            else {
                return new PPTUIManager(type);
            }
        }
    };



    var uiManager = UIManagerFactory.createUIManager(window.pageType); // already initialized



});