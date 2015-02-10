function execute(metricData,javascriptResultSetHelper) {

// This script takes RTTM and procedurally calculated metrics and calculate real time availability
// for defined CEM business transactions.
//NOTE: Refer to the RTAM doc for instructions on setting up calculators needed for this script to 
// calculate availability percentage. 
//NOTE: There is a bug in CEM where transaction defects are NOT reported on a one to one basis. This can affect calculation and skew results. PM is aware.
// by Rob Calfee
//NOTE: Updates by Hiko Davis, CA Technologies

    var i=0;  					// binding iterator for transaction total
    var x=0;					// binding iterator for matching defect count
	var totalTrnxName = {};		// array of Total Transactions Per Interval Metric Name
	var totalTrnxCount = {};	// array of Total Transactions Per Interval Count
	var defectName = {};		// array of Defects Per Interval Name
	var defectCount = {};		// array of Defects Per Interval Value
	

	// Collects Agent, Metric, and Values from the Input, from the EM and filters out only the Availability transaction data
	//log.info(" BEGIN ********************************************** ")
	//log.info("FIRST LOOP to find Total Transactions and Total Availability Defects and set them in arrays");
    for (i=0; i < metricData.length; i++) {
        var metric = metricData[i].agentMetric.attributeURL;
        var agent = metricData[i].agentName.processURL;
        var value = metricData[i].timeslicedValue.value;
        var frequency = metricData[i].frequency;
     	var isAbsent = metricData[i].timeslicedValue.dataIsAbsent();
		

//log.info("First Conditional Statement");
//Filter out "Total Transactions" and "Total Availability Defects" if they are not absent in the metric array
//cut out their top level path and agent path, using the "fullBTTree," or full path with agent name, as
//the index of the arrays and populate the transaction and defect arrays, using the the index as the primary key

//loop through the filter metrics of the EM's metric array
		if (metric.indexOf(":Total Transactions") || metric.indexOf(":Total Availability Defects") && (isAbsent == false) )
		{
			//log.info(" ");
		    //log.info("metric: " + metric);
			//log.info("agent:  " + agent);
			//log.info("value: " + value);
			//log.info("frequencey: " + frequency);
			//log.info("isAbsent: " +isAbsent);
		    
		   var BTTopLevel = metric.substring(0, metric.indexOf(":")); // top level path w/o metric name
		   var fullBTTree = agent +"|"+ BTTopLevel;  // full path with agent name
		   var fullTreeWithMetricName = fullBTTree + ":Availability %"; //saved for later when inserting the new calculate Availability percentage

		   
//log.info("Second Conditional Statement");
//load the each array, Transaction and Defect, using the fullBTTree as the index to create a primary key for matching transactions to defects

		   if (metric.indexOf(":Total Transactions") > 0) {
				totalTrnxName[fullBTTree] = fullBTTree;	// store Total Transactions Per Interval metric tree
				totalTrnxCount[fullBTTree] = value; // store Total Transactions value
				
				//log.info(" ");
				//log.info("BTTopLevel: " + BTTopLevel);
				//log.info("fullBTTree: " + fullBTTree);
				//log.info("fullTreeWithMetricName: " + fullTreeWithMetricName);
				//log.info("totalTrnxName: " + totalTrnxName[fullBTTree]);
				//log.info("totalTrnxCount: " + totalTrnxCount[fullBTTree]);
				//log.info(" ");
					
			}
			else { // Handle Defects Per Interval for only Availability types (Missing Response, Client Request Error, Server Error)
				// store value and full path
				defectName[fullBTTree] = fullBTTree; //store total defects per interval metric tree
				defectCount[fullBTTree] = value; //store the defect count

				//log.info(" ");
				//log.info("BTTopLevel: " + BTTopLevel);
				//log.info("fullBTTree: " + fullBTTree);
				//log.info("fullTreeWithMetricName: " + fullTreeWithMetricName);
				//log.info("defectName: " + defectName[fullBTTree]);
				//log.info("defectCount: " + defectCount[fullBTTree]);
				//log.info(" ");
				
			}
		}
	}
//log.info("SECOND LOOP to find match metrics for the equation and compute availability per interval");
// Loop through the transaction total and defect total arrays, match by fullBTTre (or tempMetric in this loop's case), 
// match the total transaction metric to the corresponding availability metric defect total, and then enter the metric
// into the EM under the corresponding Business Process and Business Transaction in the Custom Virtual Agent node

for (var tempMetric in totalTrnxName) {
			
		var topLevelNoDefectType = tempMetric.substring(0, tempMetric.lastIndexOf("\|"));	// remove the defect type name
		var fullTreeWithMetricName = tempMetric + ":Availability %"; //saved for later when inserting the new calculate Availability percentage
		var defectValue = defectCount[tempMetric]; //find the matching availability defect count for this transaction using the tempMetric path

		//log.info(" ");
		//log.info("topLevelNoDefectType: " + topLevelNoDefectType);
		//log.info("fullTreeWithMetricName: " + fullTreeWithMetricName);
		//log.info("tempMetric: " + tempMetric);
		//log.info("defectValue: " + defectValue);
		//log.info("totaltrxCount: " + totalTrnxCount[tempMetric]);
		//log.info(" ");



		// report metric as 0 if we were going to divide by zero
		var percentValue = new java.lang.Long(0);
		value = 0;

// Third Conditional Statement
// Calculate the availability percentage by checking to see there are non-zero numbers (if not calculate 100%)
// Calculate the availability percentage to provide a percentage of transactions successful
// If there is a negative, default to 0% to account for CEM's bug of sending multiple Missing Response defects per transacion
// **THERE should be only one, but RTTM sends multiple
// convert to a percentage and insert the metric into the EM

//log.info("Third Conditional Statement");
		if (totalTrnxCount[tempMetric] > 0 && defectValue > 0) {    //if the metrics are 0, jump to the else and make availability 100%, to avoid dividing by 0
			//log.info("Divide defect  count " + defectValue + " by " + totalTrnxCount[tempMetric]);
			var pValue = (100-((defectValue / totalTrnxCount[tempMetric]) * 100));  //calculate the the availability percentage
			if (pValue < 0) // if the result is 0 
			{
				//ADDED because CEM can have multiple Missing Response Defects per transaction, checking with Gautam, defaulting to 0!!!!! Rob Calfee
				//log.info("NEGATIVE VALUE from too many defects per transaction or single transaction: " + pValue);
				value = 0;
				percentValue = new java.lang.Long(value);
				//log.info("percent value before else: " + percentValue);
			}
			else {
                value = Math.round(pValue);
                percentValue = new java.lang.Long(value);
                //log.info("percent value before else: " + percentValue);
			}
		}
		else {  //set to 100% if any of the metrics are 0
            value = 100;
			percentValue = new java.lang.Long(value);
			//log.info("percent value After else: " + percentValue);
		}
		
		//log.info("full tree with metric name: " + fullTreeWithMetricName);

		// add the calculated value to the result set Availability %
		javascriptResultSetHelper.addMetric(fullTreeWithMetricName,
			1, percentValue, 0, percentValue,
			javascriptResultSetHelper.kIntegerPercentage,
			frequency)
    }
	//log.info("END of LOOP");
 
	//log.info(" END *********************************************"); 
    return javascriptResultSetHelper;
}

function getAgentRegex() {
    return "Custom(.*)";
}
function getMetricRegex() {
    return "Availability.*";
}

// must return a multiple of default system frequency (currently 15 seconds)
function getFrequency() {
	// return 1 * Packages.com.wily.introscope.spec.metric.Frequency.kDefaultSystemFrequencyInSeconds;
    return 15;
}

// Return false if the script should not run on the MOM.
// Scripts that create metrics on agents other than the Custom Metric Agent
// should not run on the MOM because the agents exist only in the Collectors.
// Default is true.
function runOnMOM() 
{
	return true;
}