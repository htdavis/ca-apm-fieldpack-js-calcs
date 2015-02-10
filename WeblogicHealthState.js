// Convert JMX Strings To Integers Javascript Calculator
// By Seth Schwartzman, CA/Wily, 07/2007 (Originally for Tibco)
// Cloned by Tommy Noonan, RFD, 07/2013, for pulling/converting Weblogic HealthState
//		Assumes you have added the threadpool mbean HealthState and configured your agent
//		to allow the polling of String values via jmx.

var fixedNameDir="JMX\\|com.bea\\|Name=ThreadPoolRuntime\\|ServerRuntime=.*\\|Type=ThreadPoolRuntime";
	
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

		if (metricValueAsString.indexOf("HEALTH_OK") != -1)
		{
			log.debug("Health is OK!!!");
			var status=0;
			log.debug("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("HEALTH_WARN") != -1)
		{
			log.debug("Health in Warning State!!!");
			var status=1;
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("HEALTH_CRITICAL") != -1)
		{
			log.debug("Health in Critical State!!!");
			var status=2;
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("HEALTH_FAILED") != -1)			
		{
			log.debug("Health in Failed State!!!");
			var status=3;
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("HEALTH_OVERLOADED") != -1)
		{
			log.debug("Health is Overloaded State!!!");
			var status=4;
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
		} else if (metricValueAsString.indexOf("LOW_MEMORY_REASON") != -1) 
		{
			log.debug("Health is LOW_MEMORY state!!!");
			log.info("WeblogicHealthState values-->  Metric Name: " + metricOrigName + "  Metric Value: " + metricValueAsString);
			var status=5;
		}

		var agent = metricData[i].agentName.processURL;
		frequency = metricData[i].frequency;
		log.debug("Agent Name: " + agent);
		log.debug("Frequency: " + frequency);

		var split = metricOrigName.split(':');
		
		var metricName = agent + "|" + split[0] + ":" + "HealthStatus";
		log.debug("New Metric Name: " + metricName);

		try {
			javascriptResultSetHelper.addMetric(metricName, status,	Packages.com.wily.introscope.spec.metric.MetricTypes.kIntegerConstant, frequency); 
		} catch(err) {
			// debug stmt
			 log.debug("Error calling javascriptResultSetHelper in WeblogicHealthState.js" + err);
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
	return "JMX\\|com.bea\\|Name=ThreadPoolRuntime\\|ServerRuntime=.*\\|Type=ThreadPoolRuntime:HealthState"
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
