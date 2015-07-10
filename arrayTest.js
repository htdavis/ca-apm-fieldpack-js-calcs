/**
 * Test script to determine how to effectively hold and return metricdata
 */
var metricData = [
    "SuperDomain|test1|Tomcat|Tomcat Agent|Frontends|Apps|Feed API Web Application:Errors Per Interval",
    "SuperDomain|test1|Tomcat|Tomcat Agent|Frontends|Apps|Feed API Web Application:Responses Per Interval",
    "SuperDomain|test1|Tomcat|Tomcat Agent|Frontends|Apps|activity:Errors Per Interval",
    "SuperDomain|test1|Tomcat|Tomcat Agent|Frontends|Apps|activity:Responses Per Interval",
    "SuperDomain|test2|Tomcat|Tomcat Agent|Frontends|Apps|Feed API Web Application:Errors Per Interval",
    "SuperDomain|test2|Tomcat|Tomcat Agent|Frontends|Apps|Feed API Web Application:Responses Per Interval",
    "SuperDomain|test2|Tomcat|Tomcat Agent|Frontends|Apps|activity:Errors Per Interval",
    "SuperDomain|test2|Tomcat|Tomcat Agent|Frontends|Apps|activity:Responses Per Interval"
];
var epiArray = [];
var rpiArray = [];

for (var i=0; i < metricData.length; i++) {
    var metricArray = metricData[i].split(":");
    var agentName = metricArray[0].substring(0,(metricArray[0].lastIndexOf("\|")-15));
    var appName = metricArray[0].substring(metricArray[0].lastIndexOf("\|")+1);
    var metricTree = metricArray[0].substring(metricArray[0].lastIndexOf("\|")-14);
    var value = Math.floor(Math.random()*11); //random number between 0-10
    
    if (metricArray[1] === "Errors Per Interval") {
        epiArray.push([appName,agentName,metricTree,value,15]);
    }
    else {
        rpiArray.push([appName,agentName,metricTree,value,15]);
    }
}

/*
 * begin loop through RPI
 */
for (var r=0; r < rpiArray.length; r++) {
    /*
     * begin loop through EPI
     */
    for (var e=0; e < epiArray.length; e++) {
        // compare appName, agentName get properly matching metrics for math procedure
        if (epiArray[e][0] === rpiArray[r][0] && epiArray[e][1] === rpiArray[r][1]) {
            if (rpiArray[r][3] > 0 && epiArray[e][3] > 0) {
                availValue = Math.round(100 - ((epiArray[e][3]/rpiArray[r][3]*1.0)*100));
            }
            else if (rpiArray[r][3] > 0 && epiArray[e][3] == 0) {
                var availValue = 100;
            }
            else {
                var availValue = 0;
            }
            var metricName = rpiArray[r][1] + "|" + rpiArray[r][2] + ":Availability %";
            print("metric: " + metricName);
            print("value: " + availValue);
        }
    }
}