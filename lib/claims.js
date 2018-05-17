/**
 * Authorize status of a RCD (request seeking Customer Details)
 * @param {org.insurance.network.authorizeRCD} authReq - authorize the rcd response
 * @transaction
 */
function authorizeRCD(authReq) {
	console.log('auth RCD details');
	
	var factory = getFactory();
	var NS = 'org.insurance.network';
	var NSSys = 'org.hyperledger.composer.system';


  	// get RCD
  	return getAssetRegistry(NS + '.RequestCustomerDetails')
	.then(function(registry) {
		return registry.get(authReq.rcdId)
		.then(function(req) {
			//go through the responses
			for (n = 0; n < req.responses.length; n++) {
				if (authReq.recInsCoId == req.responses[n].insCoId) {
					req.responses[n].matchStatus = authReq.matchStatus;
					if (authReq.matchStatus == "FOUND") {
						req.responses[n].matchLevel = authReq.matchLevel;
						req.responses[n].name = authReq.name;
						req.responses[n].contact = authReq.contact;
					}
				}
			}
			//emit event
			var event = factory.newEvent(NS, 'authorizeRCDEvent');
			event.rcdId = authReq.rcdId;
			event.insCoId = authReq.recInsCoId; //orig req id
			event.matchStatus = authReq.matchStatus;
			emit(event);

			//update req
			return registry.update(req);
		})
	})
}
/**
 * Update the status of a RCD (request seeking Customer Details)
 * @param {org.insurance.network.approveRCD} updateReqStatus - update the request
 * @transaction
 */
function approveRCD(updateReqStatus) {
	console.log('update RCD details');
	
	var factory = getFactory();
	var NS = 'org.insurance.network';

	var insShrA = []

  	// get RCD
  	return getAssetRegistry(NS + '.RequestCustomerDetails')
	.then(function(registry) {
		return registry.get(updateReqStatus.rcdId)
		.then(function(req) {
			var currReqStatus = req.reqStatus;
			if (currReqStatus != 'PENDING')
				throw new Error('RequestCustomerDetails status should be PENDING for it to be changed to REQ_APPROVED');
			//update req to REQ_APPROVED
			req.reqStatus = 'REQ_APPROVED'
			//collect all ins cos
			var insCoA = [];
			for (n = 0; n < req.responses.length; n++) {
				req.responses[n].matchStatus = 'NOT_FOUND';
				insCoA.push(req.responses[n].insCoId);
			}
			return query('selectCustBySSN_DOB', { ssnPar: req.SSN,dobPar:req.dateOfBirth})
			.then(function (custRecs) {
				for (var n = 0; n < custRecs.length; n++) {
					var custRec = custRecs[n];
					if (insCoA.includes(custRec.insCoId)) {
						if (custRec.rightToShare == false) {
							//match status already set to NOT_FOUND for the sender
							//generate event for notification
							var event = factory.newEvent(NS, 'ReceiverRCDEvent');
							event.rcdId = req.reqCustDetId;
							event.insCoId = req.insCoId; //orig req id
							event.recInsCoId = custRec.insCoId;
							//create response
							response = factory.newConcept(NS, 'Response');
							response.insCoId = custRec.insCoId;
							response.matchStatus = 'NOT_FOUND';
							response.matchLevel = 'CUST_NOSHARE';
							response.name = custRec.custName;
							response.contact = custRec.Contact;
							event.response = response;
							emit(event);
						} else if (req.name.toUpperCase() == custRec.custName.toUpperCase()) {
							//good match - set response 
							req.responses[n].matchStatus = 'FOUND';
							req.responses[n].matchLevel = 'GOOD_MATCH';
							req.responses[n].name = custRec.custName;
							req.responses[n].contact = custRec.Contact;
							//generate event for notification
							var event = factory.newEvent(NS, 'ReceiverRCDEvent');
							event.rcdId = req.reqCustDetId;
							event.insCoId = req.insCoId; //orig req id
							event.recInsCoId = custRec.insCoId;
							//create response
							response = factory.newConcept(NS, 'Response');
							response.insCoId = custRec.insCoId;
							response.matchStatus = 'FOUND';
							response.matchLevel = 'GOOD_MATCH';
							response.name = custRec.custName;
							response.contact = custRec.Contact;
							event.response = response;
							emit(event);							
						}else {
							//sub match - set response PENDING
							req.responses[n].matchStatus = 'PENDING';
							//gen event for auth
							var event = factory.newEvent(NS, 'ReceiverRCDEvent');
							event.rcdId = req.reqCustDetId;
							event.insCoId = req.insCoId; //orig req id
							event.recInsCoId = custRec.insCoId;
							//create response
							response = factory.newConcept(NS, 'Response');
							response.insCoId = custRec.insCoId;
							response.matchStatus = 'FOUND';
							response.matchLevel = 'SUB_NAME';
							response.name = custRec.custName;
							response.contact = custRec.Contact;
							event.response = response;
							emit(event);							
						}
					}
				}//for custRec
			}) //fn custrec
			.then (function() {
				return query('selectNomByDOB_Name', { namePar: req.name,dobPar:req.dateOfBirth})
				.then(function (polRecs) {
					for (var n = 0; n < polRecs.length; n++) {
						var polRec = polRecs[n];
						if (insCoA.includes(polRec.insCoId)) {
							//sub match - set response PENDING
							req.responses[n].matchStatus = 'PENDING';
							//gen event for auth
							var event = factory.newEvent(NS, 'ReceiverRCDEvent');
							event.rcdId = req.reqCustDetId;
							event.insCoId = req.insCoId; //orig req id
							event.recInsCoId = polRec.insCoId;
							//create response
							response = factory.newConcept(NS, 'Response');
							response.insCoId = polRec.insCoId;
							response.matchStatus = 'FOUND';
							response.matchLevel = 'SUB_SSN';
							response.name = polRec.nom.nomName;
							response.contact = polRec.nom.nomContact;
							event.response = response;
							emit(event);							
						}
					}
				})
			})
			.then (function () {
				var event = factory.newEvent(NS, 'approveRCDEvent');
				event.rcdId = req.reqCustDetId;
				event.insCoId = req.insCoId;
				event.rcdStatus = 'REQ_APPROVED';
				emit(event);
				return registry.update(req);
			})
		})
	})
}
				



/**
 * Update Cant trace nominee in the insurance policy
 * @param {org.insurance.network.UpdateCantTraceNominee} updateCust - update the Ins Policy
 * @transaction
 */
function UpdateCantTraceNominee(updateCust) {
	console.log('update cant trace customer nominee');
	
	var factory = getFactory();
	var NS = 'org.insurance.network';

  	// get InsPolicy
	return getAssetRegistry(NS + '.InsPolicy')
	.then(function(registry) {
		return registry.get(updateCust.insPolId)
		.then(function(policy) {
			var insCoId = policy.insCoId;
			if (policy.isClosed)
				throw new Error('Policy is closed. Cannot initiate request to trace Nominee');
			//get cust rec
			return getAssetRegistry(NS + '.InsuranceCustomer')
			.then(function(areg) {
				custkey = policy.insCoId + "-" + policy.insCoCustId
				return areg.get(custkey)
				.then(function (custrec) {
					//chk if ins cust is marked as dead else error
					if (!custrec.isDead)
						throw new Error('Customer is not dead - cannot mark Nominee UNTRACEABLE');
				})
			})

			.then (function() {
				//mark UNTRACEABLE
				policy.nomineeContactable = 'UNTRACEABLE';
				//update policy
				return registry.update(policy)
			})
			.then (function () {	
				//create send req message
				var req = factory.newResource(NS, 'RequestCustomerDetails',policy.insCoId + "-" + policy.insPolId);
				req.insCoId = policy.insCoId;
				req.reqStatus = 'PENDING'
				req.name = policy.nom.nomName;
				req.contact = policy.nom.nomContact;
				req.SSN = policy.nom.nomSSN;
				req.dateOfBirth = policy.nom.nomDateOfBirth;
				req.lastUpdateDate = policy.nomContactUpdateDate;
				req.updateDate = updateCust.updateDate;
				//add pending responses
				//get ins company rec
				return getParticipantRegistry(NS + '.InsuranceCompany')
				.then(function(preg) {
					return preg.get(insCoId)
					.then(function (insCoRec) {
						//get sharing agreements
						insShrA = insCoRec.insAgree;
						responses = []
						for (n=0; n < insShrA.length; n++) {
							//create response for each company
							response = factory.newConcept(NS, 'Response');
							response.insCoId = insShrA[n]
							response.matchStatus = 'PENDING'

							responses.push(response);
						}
						req.responses = responses;
					})
				})
				.then (function() {
					// save Request
					return getAssetRegistry(req.getFullyQualifiedType())
					.then(function (registry) {
						return registry.add(req);
					})
					.then(function(){
					var event = factory.newEvent(NS, 'RequestCustomerDetailsEvent');
					event.reqCustDetId = req.reqCustDetId;
					event.insPolId = updateCust.insPolId;
					event.insCoId = insCoId;
					event.reqSentDate = updateCust.updateDate;
					emit(event);
					})
				})
			})
		})
	})
}


/**
 * Update Customer death
 * @param {org.insurance.network.UpdateCustDeath} updateCust - update the Cust asset
 * @transaction
 */
function UpdateCustDeath(updateCust) {
	console.log('update customer death');
	
	var factory = getFactory();
	var NS = 'org.insurance.network';

  	// get Cust
	return getAssetRegistry(NS + '.InsuranceCustomer')
		.then(function(registry) {
			//update deaths
			//after confirming that name and SSN are correct
			return query('selectCustBySSN', { ssnPar: updateCust.SSN })
			//return query('selectCustAll')
				.then(function (custRecs) {
					updateA = []
					for (var n = 0; n < custRecs.length; n++) {
						var custRec = custRecs[n];
					
						//update cust rec
						custRec.isDead = true;
						custRec.DateOfDeath = updateCust.DOD;
						updateA.push (registry.update(custRec));
					
						//generate event
						//Match with DOB and Name and insert level of match in the event
						var deathEvent = factory.newEvent(NS, 'UpdateCustDeathEvent');
						deathEvent.insCustId = custRec.insCustId;
						deathEvent.insCoCustId = custRec.insCoCustId;
						deathEvent.SSN = custRec.SSN;
						deathEvent.insCoId = custRec.insCoId;
						emit(deathEvent);
					}
					return Promise.all(updateA)
				})
		})  
}


