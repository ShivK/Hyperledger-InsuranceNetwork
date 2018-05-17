/**
 * 
 * @param {org.insurance.network.GetTraceNomineeHist} hist - the GetTraceNomineeHistByUser transaction
 * @transaction
 */
function getTraceNomineeHist(hist) {
    var factory = getFactory();
    var NS = 'org.insurance.network';
    return query('HistTraceByDate', { fromDatePar:hist.fromDate})
    .then(function (recs) {
        for (var n = 0; n < recs.length; n++) {
            var rec = recs[n];
            //emit events
            var event = factory.newEvent(NS, 'GetTraceNomineeHistEvent');
            event.transactionId = rec.transactionId;
            event.transactionType = rec.transactionType;
            event.transactionInvokedRef = rec.transactionInvoked.toString();
            if (!rec.participantInvokingRef)
                event.participantInvokingRef = rec.participantInvoking.toString();
            if (!rec.identityUsedRef)
                event.identityUsedRef = rec.identityUsed.toString();
            if (!rec.eventsEmitted) {
                eA = []
                for (n=0; n< rec.eventsEmitted.length; n++) {
                    e = rec.eventsEmitted[n];
                    eA.push(e);
                }
                event.eventsEmitted = eA;      
            }      
            event.transactionTimestamp = rec.transactionTimestamp;         
			emit(event);
            
        }
    })   
            
}

