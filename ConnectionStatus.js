// APM Javascript calculator for Agent connection status
// 
// Creates a MOM metric called Clusterwide Agent Connection Status for each agent connected to a cluster
//  
// This metric reports a value of 1, as long as the agent is connected to a collector in the cluster
// Otherwise it reports the highest error code reported by any collector for that agent
// by default, the
//
// Duane Nielsen, 2013
//
// Note: I just fixed someone else's script, but since they didn't write any comments, may all the glory be mine!
                

function execute(metricData, javascriptResultSetHelper) {

var uidList = {};
var agentList = {};                             // list of current agents
var metricTreeList = {};  // list of the metric trees that correspond
var frequency = {};
var agentStatus = {};                       
                                                                                
                for(var i=0; i < metricData.length; i++) {                 
                                
                                // Metric looks like: Agents\|Host\|Process\|JVM:ConnectionStatus
                                var metricArray = metricData[i].agentMetric.attributeURL.split(":");
                                var agentName = java.lang.String(metricArray[0].substr(7));
                                var agentCustom = metricData[i].agentName.processURL;



                                // Custom Metric indicates a derived metric, not an agent, so we dont want to process them                      
                                if ( ! agentName.startsWith("Custom Metric") ) {

                                                // make a unique ID string that identifies the agent, regardless of the collector it's reporting to
                                                var thisUid = metricData[i].agentName.getDomain() + agentName;
                                                log.info("zzz thisUid :" + thisUid );
                                                
                                                
                                                // Initializing for new agent
                                                if(agentStatus[thisUid] == null) 
                                                                {
                                                                                agentStatus[thisUid] = 0;
                                                                }
                                                if (uidList[thisUid] == null) {
                                                                uidList[thisUid] = thisUid;
                                                                                                                                
                                                                if(metricTreeList[thisUid] == null) {
                                                                                metricTreeList[thisUid] = metricArray[0];
                                                                }                              
                                                
                                                                if(frequency[thisUid] == null) {
                                                                                frequency[thisUid] = metricData[i].frequency;
                                                                }

                                                                if(agentList[thisUid] == null) {
                                                                                agentList[thisUid] = agentCustom;
                                                                }
                                                
                                                
                                                                                
                                                }

                                                // if the agent is connected, set it connected
                                                if ( metricData[i].timeslicedValue.value == 1 ) {
                                                                agentStatus[thisUid]= metricData[i].timeslicedValue.value;
                                                }

                                                // else if we have already seen this agent connected to any collector, then leave the status as connected (1 means connnected)
                                                else if (agentStatus[thisUid] != 1) {


                                                                // else, just use the highest error value we have seen for this agent

                                                                if ( metricData[i].timeslicedValue.value > agentStatus[thisUid] ) {
                                                                                agentStatus[thisUid]= metricData[i].timeslicedValue.value;
                                                                }
                                                }

                                }
                }
                
                // now iterate found resources and report calculated metrics
                for (var uid in uidList) {
                                var agentName="SuperDomain|Custom Metric Host (Virtual)|Custom Metric Process (Virtual)|Custom Metric Agent (Virtual)";
                                var fullMetricNameStatus =  agentName + "|" +  metricTreeList[uid] + ":Clusterwide Agent Connection Status";
                
                                //log.info("ZZZ Full Metric Name Is (Status): " + fullMetricNameStatus);
                                 //log.info("ZZZ Full agent list             : " + agentList[uid]);
                                //log.info("ZZZ Metric Tree list            : " + metricTreeList[uid]);
                               // log.info("ZZZ agentName                   : " + agentName);
                                // debug stmt
                                // log.info("Full Metric Name Is (UP): " + fullMetricNameUp);

                
                                                // Connection Status
                                                if(agentStatus[uid] == null) 
                                                                {
                                                                                agentStatus[uid] = 0;
                                                                }
                                                javascriptResultSetHelper.addMetric(    fullMetricNameStatus, 
                                                                                                                                java.lang.Integer(agentStatus[uid]),
                                                                                                                                Packages.com.wily.introscope.spec.metric.MetricTypes.kIntegerAggregatingFluctuatingCounter, 
                                                                                                                                frequency[uid]);
                                                }
                // return the result set
    return javascriptResultSetHelper;
}

function getAgentRegex() {
    return "(.*)\|Custom Metric Process \(Virtual\)\|Custom Metric Agent \(Virtual\)";
}

function getMetricRegex() {
    return "Agents\|(.*):ConnectionStatus";
}

// must return a multiple of default system frequency (currently 15 seconds)
function getFrequency() {
                return 1 * Packages.com.wily.introscope.spec.metric.Frequency.kDefaultSystemFrequencyInSeconds;
}
// Return false if the script should not run on the MOM.
// Scripts that create metrics on agents other than the Custom Metric Agent
// should not run on the MOM because the agents exist only in the Collectors.
// Default is true.
function runOnMOM() 
{
                return true;
}
