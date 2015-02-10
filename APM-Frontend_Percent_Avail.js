/*
 *This script takes Frontends and procedurally calculated metrics and calculates availability
 *for defined applications.
 *NOTE: Updates by Hiko Davis, CA Technologies; 01/15/2015
 *
 *A REMINDER: If you are creating new frontends via PBD, ensure you are also using
 *ExceptionErrorReporter to properly count unhandled exceptions.
 */


function execute(metricData, javascriptResultSetHelper) {
    /*
     * For each input agent, compute a calculated metric named
     * "<agentname>|Frontends|Apps|<appname>:Availability %" as
     * that agent's "Math.round(100-((ErrorsPerInterval / ResponsesPerInterval * 1.0) * 100))".
     */
    var ResponsesPerInterval = [];  // array of RPI values
    var ErrorsPerInterval = [];     // array of EPI values

    for(var i=0; i < metricData.length; i++)
    {
        var agent = metricData[i].agentName.processURL;
        var value = metricData[i].timeslicedValue.value;
        var frequency = metricData[i].frequency;
        var metricArray = metricData[i].agentMetric.attributeURL.split(":");
        var appName = metricArray[0].substring(metricArray[0].lastIndexOf("\|")+1);


        // insert agent, appName, metric node, value, and frequency
        if (metricArray[1] == "Responses Per Interval")
        {
            ResponsesPerInterval.push([appName,agent,metricArray[0],value,frequency]);
        }
        else if (metricArray[1] == "Errors Per Interval")
        {
            ErrorsPerInterval.push([appName,agent,metricArray[0],value,frequency]);
        }
    }

    // initial variables for loops
    var metricName; //will hold new availability metric string
    var availValue; //will hold new calculated availability percentage value
    
    /*
     * now iterate found applications & agents and report calculated metrics, build result set
     * begin loop through RPI array
     */
    for (var r=0; r < ResponsesPerInterval.length; r++) {
        // begin loop through EPI array
        for (var e=0; e < ErrorsPerInterval.length; e++) {
            // compare appName, agentName get properly matching metrics for math procedure
            if (String(ErrorsPerInterval[e][0]) === String(ResponsesPerInterval[r][0]) && String(ErrorsPerInterval[e][1]) === String(ResponsesPerInterval[r][1])) {
                // check both RPI/EPI values are greater than zero
            	if (ResponsesPerInterval[r][3] > 0 && ErrorsPerInterval[e][3] > 0) {
                    // get defect % and subtract from 100 to get availability %; round to nearest whole number
                    availValue = Math.round(100 - ((ErrorsPerInterval[e][3]/ResponsesPerInterval[r][3]*1.0)*100));
                }
                else if (ResponsesPerInterval[r][3] > 0 && ErrorsPerInterval[e][3] == 0) {
                    // return 100% since EPI is 0
                    var availValue = 100;
                }
                else {
                    // return 0% availability
                    var availValue = 0;
                }
                // create the new metric name with agentName + metricTree (which has the appName)
                var metricName = ResponsesPerInterval[r][1] + "|" + ResponsesPerInterval[r][2] + ":Availability %";
                // add new metric and value as a percentage to resultset
                javascriptResultSetHelper.addMetric(metricName,
                        availValue,
                        javascriptResultSetHelper.kIntegerPercentage,
                        ResponsesPerInterval[r][4]);
            }
        }
    }
    // return the result set
    return javascriptResultSetHelper;
}

function getAgentRegex() {
    return ".*\|Tomcat\|Tomcat\ Agent.*";
}

function getMetricRegex() {
    return "Frontends\\|Apps\\|[^\\|]*:(Errors|Responses).*";
}

// must return a multiple of default system frequency (currently 15 seconds)
function getFrequency() {
    return 1 * Packages.com.wily.introscope.spec.metric.Frequency.kDefaultSystemFrequencyInSeconds;
}

/*
 * Return false if the script should not run on the MOM.
 * Scripts that create metrics on agents other than the Custom Metric Agent
 * should not run on the MOM because the agents exist only in the Collectors.
 * Default is true.
 */
function runOnMOM() {
    return false;
}