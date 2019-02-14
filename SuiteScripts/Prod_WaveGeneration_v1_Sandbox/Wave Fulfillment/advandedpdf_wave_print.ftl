<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
<macrolist>
    <macro id="waveid">
        <p class="rico-header-info">${waverecord.wavename}</p>

         <table class="ship-Table" padding="5.6in 0.2in 0.0in 5.5in" >

         <#list waverecord.shppingNotes as shipNote>
            <tr>
                <th class="rico-ship-header"> ${shipNote.name?html} </th>
              
            </tr>
          
            <tr>
                <td>${shipNote.shipInstructions?html}</td>
            
            </tr>
            </#list>
        </table>
    </macro>
     
 </macrolist>
	<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
	<#if .locale == "zh_CN">
		<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
	<#elseif .locale == "zh_TW">
		<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
	<#elseif .locale == "ja_JP">
		<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
	<#elseif .locale == "ko_KR">
		<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
	<#elseif .locale == "th_TH">
		<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
	</#if>
    <style type="text/css">
    #page1 { 
        background-image: url("http://shopping.netsuite.com/core/media/media.nl?id=6293318&amp;c=3500213_SB1&amp;h=293434d65e293fcf94a9");
    }
       
      table { font-size: 9pt; table-layout: fixed; width: 100%; }
        th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px;  padding-bottom: 10px; padding-top: 10px; }
        td { padding: 4px 6px; border: .7px solid black;}
        b { font-weight: bold; color: #333333; }
            .rico-header-info {
                line-height: 10px;
                font-size: 20px;
                align: center;
      		}

            .rico-header-info, .rico-borrower-info, .rico-table-header {
                font-weight: bold;
            }

            .rico-borrower-info {
              line-height: 10px;
            }

            .rico-borrower-info-container {
                float: left;
            }

          	.rico-pick-task{
            	width: 78%;
          	}

             .rico-table-header {
                 align: center;
             }

             .ship-table{
                  position: absolute;
                    width:20%;
                   
             }

             .rico-ship-header{
             
                font-weight: bold;
                font-size: 8pt;
                vertical-align: middle;
                padding: 5px 6px 3px;
                background-color: #e3e3e3;
                color: #333333;
       
             }
</style>
</head>

    <body background-macro="waveid" padding="0.5in 0.2in 0.2in 0.2in" size="Letter">

        <table  class="rico-pick-task" padding="1.2in 1.5in 0.2in 0.1in" >
            <tr>
                <th ></th>
                <th ></th>
                <th ></th>
                <th ></th>
                <th ></th>
               
            </tr>
            <#list waverecord.pickRecords as pickRecord>
            <tr>
                <td>${pickRecord.primarybin}</td>
                <td>${pickRecord.item}</td>
                <td>${pickRecord.qty}</td>
                <td></td>
                <td></td>
             
            </tr>
            </#list>
        </table>

    </body>
</pdf>