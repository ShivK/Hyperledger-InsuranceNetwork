
/**
 * Submit a LTC reimbursement request
 * @param {org.insurance.network.SubmitLTCReimbursement} subReq - send the request
 * @transaction
 */
function SubmitLTCReimbursement(subReq) {
    console.log('SubmitLTCReimbursement');

    var factory = getFactory();
	var NS = 'org.insurance.network';

	//get policy
	var custSSN = "";
	var billNo = "";
	var insCoId = "";
	var insShrA = [];
	var amtEligible = 0;
	var claims = [];
	var amtPayable = 0;
	var gpol;
	// get InsPolicy
	return getAssetRegistry(NS + '.InsPolicy')
  	.then(function(registry) {
		return registry.get(subReq.insPolId)
	  	.then(function(policy) {
			gpol = policy;	
			insCoId = policy.insCoId;
			if (!policy.optedLTC)
				throw new Error('This policy does not have Long term care reimbursement');
			//get cust SSN
			return getAssetRegistry(NS + '.InsuranceCustomer')
			.then(function(areg) {
				custkey = policy.insCoId + "-" + policy.insCoCustId
				return areg.get(custkey)
				.then(function (custRec) {
					custSSN = custRec.SSN;
					//convert bill no to SSN + "-" + bill no
					billNo = custRec.SSN + "-" + subReq.billNo;
					//check if bill has been sunmitted to the submitters company
					return query('selectLTCByBillNo_InsCo', { billNoPar: billNo,insCoIdPar:policy.insCoId})
					.then(function (lRecs) {
						if (lRecs.length > 0)
							throw new Error('This bill has already been submitted to your company');
						//calc eligibility etc
						numDays = Math.round((subReq.toDate - subReq.fromDate)/(1000*60*60*24));
						//numDays += 1; //both fromDate and toDate to be counted in the interval
						amtEligible = numDays * policy.amtLTCperDiem;
						amtEligible = Math.min(amtEligible,subReq.billAmt);
					})

				})
			})
			.then (function() {
				//get LTC from other companies
				//get ins company rec
				return getParticipantRegistry(NS + '.InsuranceCompany')
				.then(function(preg) {
					return preg.get(policy.insCoId)
					.then(function (insCoRec) {
						//get sharing agreements
						insShrA = insCoRec.insAgree;
						return query('selectLTCByBillNo', { billNoPar: billNo})
						.then(function (ocRecs) {
							amtPaid = 0
							//resolve policy to check sharing agreements
							//sharing agreements not for reimbursements
							claims = []
							for (var n = 0; n < ocRecs.length; n++) {
								var ocRec = ocRecs[n];
								
								//if (insShrA.includes(ocRec.policy.insCoId)) {
								if (true) {
									//collect details
									claim = factory.newConcept(NS, 'InsCoClaim');
									//claim.insCoId = ocRec.policy.insCoId;
									claim.insCoId = ocRec.insCoId;
									claim.amtPaid = ocRec.amtPaid;
									claims.push(claim);
									amtPaid += ocRec.amtPaid;
								}
							}
							amtPayable = Math.min(amtEligible,(subReq.billAmt - amtPaid))
							if (amtPayable < 0)
								amtPayable = 0;

						})						
					})				
				})				
			})
			.then (function () {
				var req = factory.newResource(NS, 'LTC', subReq.ltcRId);
				req.ltcStatus = 'SUBMITTED'
				req.insCoId = policy.insCoId;
				req.fromDate = subReq.fromDate;
				req.toDate = subReq.toDate;
				req.billNo = billNo;
				//req.billSubmitDate = subReq.billSubmitDate;
				//req.billAmtClaimed = subReq.billAmtClaimed;
				req.totalAmtEligible = amtEligible;
				req.billAmt = subReq.billAmt;
				req.claims = claims;
				//Get policy and calc totalAmtEligible
				req.policy = factory.newRelationship(NS, 'InsPolicy', subReq.insPolId);
				//TBD
				req.amtPaid = amtPayable;
				return getAssetRegistry(req.getFullyQualifiedType())
				.then(function (registry) {
					return registry.add(req);
				})
				.then(function(){
					var submitReqEvent = factory.newEvent(NS, 'SubmitLTCReimbursementEvent');
					submitReqEvent.ltcRId = req.ltcId;
					emit(submitReqEvent);
				});


			})
		  
		}) //policy
					  

	})//top level
	
}


