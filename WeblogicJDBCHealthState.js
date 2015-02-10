// Convert JMX Strings To Integers Javascript Calculator
// By Seth Schwartzman, CA/Wily, 07/2007 (Originally for Tibco)
// Cloned by Hiko Davis, CA Services, 07/2013, for pulling/converting WebLogic DataSource health state
//		Assumes you have added the JDBC*DataSource*Runtime:State and configured your agent
//		to allow the polling of String values via jmx.
//      IMPORTANT!!! - Assumes that you enabled JMX primary keys equal to Type,Name
//      IMPORTANT!!! - Assumes that you disabled JMX excludeStringMetrics

//var fixedNameDir="JMX\\|com.bea\\|JDBC.*DataSource.*Runtime\\|.*";

function execute(metricData, javascriptResultSetHelper) {
	
	for(var i=0; i < metricData.length; i++) {		
		
		var metricValueAsInt = metricData[i].timeslicedValue.value;
		var metricValueAsString = metricData[i].dataValue.valueAsString.toString();
		
		var metricIsStringTest = typeof metricValueAsInt;
		var metricValueNumberTest = /(^\d+$)|(^\d+\.\d+$)/;
		
		var metricOrigName = metricData[i].agentMetric.attributeURL;

		// debug stmts
		 log.debug("Metric Name: " + metricOrigName);
		 log.debug("Metric Value: " + metricValueAsString);

		var status=0;

		if (metricValueAsString.indexOf("Running") != -1)
		{
			log.debug("DataSource is OK!!!");
			var status=1;
			log.debug("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("Suspended") != -1)
		{
			log.debug("DataSource is Suspended!!!");
			var status=2;
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("Overloaded") != -1)
		{
			log.debug("DataSource is Overloaded!!!");
			var status=3;
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("Shutdown") != -1)			
		{
			log.debug("DataSource is Shutdown!!!");
			var status=4;
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("Unknown") != -1) 
		{
			log.debug("DataSource is Unknown!!!");
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
			var status=0;
		}

		var agent = metricData[i].agentName.processURL;
		frequency = metricData[i].frequency;
		log.debug("Agent Name: " + agent);
		log.debug("Frequency: " + frequency);

		var split = metricOrigName.split(':');
		
		var metricName = agent + "|" + split[0] + ":" + "Status";
		log.debug("New Metric Name: " + metricName);

		try {
			javascriptResultSetHelper.addMetric(metricName, status,	Packages.com.wily.introscope.spec.metric.MetricTypes.kIntegerConstant, frequency); 
		} catch(err) {
			// debug stmt
			 log.debug("Error calling javascriptResultSetHelper in WeblogicJDBCHealthState.js" + err);
		}
	}

	// return the result set
    return javascriptResultSetHelper;
}

function getAgentRegex() {
    return ".*WebLogic.*";
}

function getMetricRegex() {
	// Only return HealthState
	return "JMX\\|com.bea\\|JDBC.*DataSource.*Runtime.*\\|.*:State"
}

// must return a multiple of default system frequency (currently 15 seconds)
function getFrequency() {
	return 1 * Packages.com.wily.introscope.spec.metric.Frequency.kDefaultSystemFrequencyInSeconds;
}

//Return false if the script should not run on the MOM.
//Scripts that create metrics on agents other than the Custom Metric Agent
//should not run on the MOM because the agents exist only in the Collectors.
//Default is true.
function runOnMOM() 
{
	return false;
}
