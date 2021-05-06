/*
 *  ************************************************************************
 *  *  © [2015 - 2020] Quintype Technologies India Private Limited
 *  *  All Rights Reserved.
 *  *************************************************************************
 */
const apm = require("elastic-apm-node");

const handleSpanInstance = ({ apmInstance, isStart, title }) => {
    console.log(" DEBUG: ", "YY --------------------------->", isStart, title, apmInstance );
    if (isStart && !apmInstance) {
        return apm.startSpan(title);
    }

    if(apmInstance) apmInstance.end();
    return true;
};

module.exports = {
    handleSpanInstance
};
