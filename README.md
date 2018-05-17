# Insurance Network
# Demo for Hyperledger Composer

> This is the network for the Life Insurance companies to trace nominees of Term Life Policy holders (customers) who have died and also to prevent excess claims in the case that the customer has a Long Term care Reimbursement rider on his life insurance policy

This network defines:

**Participant**
`InsuranceCompany`
`InsuranceEmployee`
`InsuranceRegulator`

**Asset**
`InsSharingAgreement`
`InsuranceCustomer`
`InsPolicy`
`RequestCustomerDetails`
`LTC`

**Transaction**
`UpdateCantTraceNominee`
`approveRCD`
`authorizeRCD`
`SubmitLTCReimbursement`
`UpdateCustDeath`
`GetTraceNomineeHist`

**Event**
`RequestCustomerDetailsEvent`
`approveRCDEvent`
`ReceiverRCDEvent`
`authorizeRCDEvent`
`SubmitLTCReimbursementEvent`
`UpdateCustDeathEvent`

There are three types of users in the system.
InsuranceCompany is the representative of the insurance company who signs sharing agreements with other insurance companies. The information here is also the registration information into the system where they are allocated ids that is used as a unique identifier throughout the syste,
An InsuranceEmployee is an employee of the system. The level of the insurance employee indicates whether this employee is an agent or a manager.
An InsuranceRegulator 
An overall regulator of the system who monitors the nominee request enquiries to ensure no spurious or phishing happens.

There are five types of Assets. An InsSharingAgreement is between two companies where they agree to share customer nominee contact details and details of LTC reimbursement claims made by its customers. In the case of tracing a nominee when the Term life policy holder (customer) is dead, the customer confidentiality clause holds (re the nominee and contacts information) and is overridden by this agreement. However in the case of LTC reimbursement claims, the claims made by the customer are shared by the companies.  
An InsuranceCustomer is a InsPolicy holder in an InsuranceCompany. As each insurance company will enter details of its customers, a real life person (with a single SSN) may appear as multiple instances of InsuranceCustomer records.
An InsPolicy is issued by an InsuranceCompany to its InsuranceCustomer. This is a Term Life Policy which may have an optional Long Term Care reimbursement rider attached to it.
A RequestCustomerDetails keeps track of a trace nominee request sent out by an InsuranceCompany agent, its approval by the sending company's manager and the responses from other insurance companies.
A  LTC records the reimbursement claims made by customers to insurance companies.

**Notes**
A name is modelled as a single field here. It could consist of First name, Last name, Middle name and Suffix - but for the sake of simpplicity it is comsidered as a single string field here.
Similarly, contact information is modelled as a single string here. It could consist of an address, email, phone or other forms of contact. Also an address itself could be multiple fields.
Matching of names and contacts could be a simple string match or a complex fuzzy match involving many parameters. That is outside the scope here. A simple string match is considered a match for this demo.

**Transaction Flow**
An agent in the enqioring company marks the nominee as untraceable in the policy record. The customer has to be dead and the policy should not already be closed. This creates a RequestCustomerDetails record in the system.
A manager of this company approves this request. If the record is not found in other companies records then the system automatically marks the customer as not found for that company. If it is a case of Perfect match or a Customer privacy refusal, the system automatically marks the record as not found for that company and sends a notification to the manager of the second company.
If the match is sub par, then a authorization requet is sent to the manager of the second company who can then approve.deny the request. 

For LTC reimbursement claims, an agent of the company submits the Bill and the payable amount is advised by the system with details on where he has claimed other amounts.


**Test**
To test this Network Definition in the **Test** tab:
Import the insurance-network.bna file in the Composer-playground.

Run the SetupDemoInsCo transaction.
Run the SetupDemoCust transaction.
Run the SetupDemoPolicies transaction.
This sets up the insurance companies, customers and policies used in the demo.
This is as illustrated in the smapledata.csv provided in the data directory.
You should now be able to see all of these in the Registry.

Setup user identity for Shashi Capoor as 'sashi' and link it to the identity '1001'.
Setup user identity for Martina Wingis as 'martina' and link it to the identity '2007'.
Setup user identity for Abbas Khan as 'abbas' and link it to the identity '434343'.
The corresponding screens from Composer playground are shown below for reference.
```

1001
{
  "$class": "org.insurance.network.InsuranceEmployee",
  "insEmpId": "1001",
  "insCoId": "145",
  "insEmpName": "Shashi Capoor",
  "insEmpContact": "shashi.capoor@mapleleaf.com",
  "insEmplevel": "AGENT"
}
```
```
2007
{
  "$class": "org.insurance.network.InsuranceEmployee",
  "insEmpId": "2007",
  "insCoId": "145",
  "insEmpName": "Martina Wingis",
  "insEmpContact": "martina.wingis@mapleleaf.com",
  "insEmplevel": "MANAGER"
}
```
```
434343
{
  "$class": "org.insurance.network.InsuranceEmployee",
  "insEmpId": "434343",
  "insCoId": "3142",
  "insEmpName": "Abbas Khan",
  "insEmpContact": "akhan@kingfisherml.com",
  "insEmplevel": "AGENT"
}
```

Next - the policy number '145-12244-1258000' is shown here.
```
145-12244-1258000
{
  "$class": "org.insurance.network.InsPolicy",
  "insPolId": "145-12244-1258000",
  "insCoId": "145",
  "insCoCustId": "12244",
  "polNo": "1258000",
  "polStartDate": "2000-05-10T18:30:00.000Z",
  "polEndDate": "2020-04-10T18:30:00.000Z",
  "sumAssured": 200000,
  "isNomineeCustomer": false,
  "nom": {
    "$class": "org.insurance.network.Nominee",
    "nomReln": "DAUGHTER",
    "nomName": "Katy Malaparte",
    "nomContact": "2217 Eiffel Ave Wilmington Delaware DE 28401",
    "nomSSN": "080-08-0800",
    "nomDateOfBirth": "1970-12-13T18:30:00.000Z"
  },
  "nomContactUpdateDate": "1970-12-13T18:30:00.000Z",
  "optedLTC": false,
  "amtLTCperDiem": 0,
  "nomineeContactable": "OK",
  "isClosed": false
}
```
Use Abbas to invoke the transaction `UpdateCantTraceNominee` and enter policy number 24-754321-12345 as shown below: 
```
{
  "$class": "org.insurance.network.UpdateCantTraceNominee",
  "insPolId": "24-754321-12345",
  "updateDate": "2017-10-02T04:33:46.808Z"
}
```
You should get the error:
Error: Customer is not dead - cannot mark Nominee UNTRACEABLE

Use Abbas to invoke the transaction `UpdateCantTraceNominee` and enter policy number 3142-327450-1257000: 
You should get the error:
Error: Policy is closed. Cannot initiate request to trace Nominee

Use Abbas to invoke the transaction `UpdateCantTraceNominee` and enter policy number 145-12244-1258000.
As Abbas is an agent in another company the ACL kicks in and prevents him updating the record.
You should get the error:
Error: t: Participant 'org.insurance.network.InsuranceEmployee#434343' does not have 'UPDATE' access to resource 'org.insurance.network.InsPolicy#145-12244-1258000'

Now use the id sashi.
Invoke the transaction `UpdateCantTraceNominee` and enter policy number 145-12244-1258000.

This generates a RequestCustomerDetailRequest
```
145-145-12244-1258000
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-12244-1258000",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "PENDING"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "PENDING"
    }
  ],
  "name": "Katy Malaparte",
  "contact": "2217 Eiffel Ave Wilmington Delaware DE 28401",
  "SSN": "080-08-0800",
  "dateOfBirth": "1970-12-13T18:30:00.000Z",
  "lastUpdateDate": "1970-12-13T18:30:00.000Z",
  "reqStatus": "PENDING",
  "updateDate": "2017-10-02T04:48:13.009Z"
}
```
and generates a event for approval by his manager martina.
```
{
 "$class": "org.insurance.network.RequestCustomerDetailsEvent",
 "reqCustDetId": "145-145-12244-1258000",
 "insPolId": "145-12244-1258000",
 "insCoId": "145",
 "reqSentDate": "2017-10-02T04:48:13.009Z",
 "eventId": "e67894b1-9039-4efb-a84c-8403e245dcbd#0",
 "timestamp": "2017-10-02T04:48:33.803Z"
}
```

Use id martina to approce this request to invoke the transaction `approveRCD' and enter the rcdId 145-145-12244-1258000 as shown:
```
{
  "$class": "org.insurance.network.approveRCD",
  "updateDate": "2017-10-02T04:51:27.979Z",
  "rcdId": "145-145-12244-1258000"
}
```

Now look at the `RequestCustomerDetails` with the id 145-145-12244-1258000
```
145-145-12244-1258000
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-12244-1258000",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "FOUND",
      "matchLevel": "GOOD_MATCH",
      "contact": "42 Lexington Ave Washington DC 20002",
      "name": "Katy Malaparte"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "NOT_FOUND"
    }
  ],
  "name": "Katy Malaparte",
  "contact": "2217 Eiffel Ave Wilmington Delaware DE 28401",
  "SSN": "080-08-0800",
  "dateOfBirth": "1970-12-13T18:30:00.000Z",
  "lastUpdateDate": "1970-12-13T18:30:00.000Z",
  "reqStatus": "REQ_APPROVED",
  "updateDate": "2017-10-02T04:48:13.009Z"
}
```
Note that there is a automatic response from company id (24) as it is a perfect match (GOOD_MATCH).
Automatic denial from company (3142) as there are no matching records.

**Scenario II**
sashi 
```
145-145-12244-1258001
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-12244-1258001",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "PENDING"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "PENDING"
    }
  ],
  "name": "Napolean Malaparte II",
  "contact": "2217 Eiffel Ave Wilmington Delaware DE 28401",
  "SSN": "242-86-7010",
  "dateOfBirth": "1968-12-09T18:30:00.000Z",
  "lastUpdateDate": "1968-12-09T18:30:00.000Z",
  "reqStatus": "PENDING",
  "updateDate": "2017-10-02T04:57:03.556Z"
}
```

martina approves
```
145-145-12244-1258001
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-12244-1258001",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "NOT_FOUND"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "NOT_FOUND"
    }
  ],
  "name": "Napolean Malaparte II",
  "contact": "2217 Eiffel Ave Wilmington Delaware DE 28401",
  "SSN": "242-86-7010",
  "dateOfBirth": "1968-12-09T18:30:00.000Z",
  "lastUpdateDate": "1968-12-09T18:30:00.000Z",
  "reqStatus": "REQ_APPROVED",
  "updateDate": "2017-10-02T04:57:03.556Z"
}
```
Confidentiality clause of Napolean Malaparte Jr in company Kingfisher Mutual (3142) results in automatic denial and notification sent to Kingfisher's manager. 

Event ("CUST_NOSHARE' as reason) sent to second company manager.
```
{
 "$class": "org.insurance.network.ReceiverRCDEvent",
 "rcdId": "145-145-12244-1258001",
 "insCoId": "145",
 "recInsCoId": "3142",
 "response": {
  "$class": "org.insurance.network.Response",
  "insCoId": "3142",
  "matchStatus": "NOT_FOUND",
  "matchLevel": "CUST_NOSHARE",
  "contact": "425 Hyacinth Way  Miami FL  33018",
  "name": "Napolean Malaparte II"
 },
 "eventId": "5774f536-9dc8-4856-8bdc-bb14bac8c208#0",
 "timestamp": "2017-10-02T05:00:01.532Z"
}
```

**Scenario III**
Bill Wryson's policy
```
145-278945-820056
{
  "$class": "org.insurance.network.InsPolicy",
  "insPolId": "145-278945-820056",
  "insCoId": "145",
  "insCoCustId": "278945",
  "polNo": "820056",
  "polStartDate": "1992-07-31T18:30:00.000Z",
  "polEndDate": "2022-06-30T18:30:00.000Z",
  "sumAssured": 100000,
  "isNomineeCustomer": false,
  "nom": {
    "$class": "org.insurance.network.Nominee",
    "nomReln": "SPOUSE",
    "nomName": "Indu Wryson",
    "nomContact": "21 Kingsbury Way Austin TX 78708",
    "nomSSN": "223-42-1980",
    "nomDateOfBirth": "1942-07-06T18:30:00.000Z"
  },
  "nomContactUpdateDate": "1942-07-06T18:30:00.000Z",
  "optedLTC": false,
  "amtLTCperDiem": 0,
  "nomineeContactable": "OK",
  "isClosed": false
}
```

sashi enters 145-278945-820056
RCD record
```
145-145-278945-820056
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-278945-820056",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "PENDING"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "PENDING"
    }
  ],
  "name": "Indu Wryson",
  "contact": "21 Kingsbury Way Austin TX 78708",
  "SSN": "223-42-1980",
  "dateOfBirth": "1942-07-06T18:30:00.000Z",
  "lastUpdateDate": "1942-07-06T18:30:00.000Z",
  "reqStatus": "PENDING",
  "updateDate": "2017-10-02T05:16:56.934Z"
}
```
martina approves 
RCD rec
```
145-145-278945-820056
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-278945-820056",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "PENDING"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "NOT_FOUND"
    }
  ],
  "name": "Indu Wryson",
  "contact": "21 Kingsbury Way Austin TX 78708",
  "SSN": "223-42-1980",
  "dateOfBirth": "1942-07-06T18:30:00.000Z",
  "lastUpdateDate": "1942-07-06T18:30:00.000Z",
  "reqStatus": "REQ_APPROVED",
  "updateDate": "2017-10-02T05:16:56.934Z"
}
```
Receiver event
```
{
 "$class": "org.insurance.network.ReceiverRCDEvent",
 "rcdId": "145-145-278945-820056",
 "insCoId": "145",
 "recInsCoId": "24",
 "response": {
  "$class": "org.insurance.network.Response",
  "insCoId": "24",
  "matchStatus": "FOUND",
  "matchLevel": "SUB_NAME",
  "contact": "67 18th St Boston MA 01841",
  "name": "Indira Bandhi"
 },
 "eventId": "cf213bc7-d2ab-4aa4-82e6-fc1f1fdf5225#0",
 "timestamp": "2017-10-02T05:20:30.206Z"
}
```
karl narx (id karl) denies the request through `authorizeRCD` transaction as he feels that the names do not match.
```
{
  "$class": "org.insurance.network.authorizeRCD",
  "rcdId": "145-145-278945-820056",
  "matchStatus": "NOT_FOUND",
  "insCoId": "145",
  "recInsCoId": "24",
  "matchLevel": "SUB_NAME",
  "name": "",
  "contact": ""
}
```

RCD record now
```
145-145-278945-820056
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-278945-820056",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "NOT_FOUND"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "NOT_FOUND"
    }
  ],
  "name": "Indu Wryson",
  "contact": "21 Kingsbury Way Austin TX 78708",
  "SSN": "223-42-1980",
  "dateOfBirth": "1942-07-06T18:30:00.000Z",
  "lastUpdateDate": "1942-07-06T18:30:00.000Z",
  "reqStatus": "REQ_APPROVED",
  "updateDate": "2017-10-02T05:16:56.934Z"
}
```

**Scenario IV**
Sashi polid 145-898989-1256722 (Margaret Bead)
RCD
```
145-145-898989-1256722
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-898989-1256722",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "PENDING"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "PENDING"
    }
  ],
  "name": "Alicia Bead",
  "contact": "442 College Close Oxford OX3 United Kingdom",
  "SSN": "",
  "dateOfBirth": "1965-08-07T18:30:00.000Z",
  "lastUpdateDate": "1965-08-07T18:30:00.000Z",
  "reqStatus": "PENDING",
  "updateDate": "2017-10-02T05:36:20.632Z"
}
```
martina authorizes 145-145-898989-1256722
nominee matches - no SSN
RCD record now
```
145-145-898989-1256722
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-898989-1256722",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "NOT_FOUND"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "PENDING"
    }
  ],
  "name": "Alicia Bead",
  "contact": "442 College Close Oxford OX3 United Kingdom",
  "SSN": "",
  "dateOfBirth": "1965-08-07T18:30:00.000Z",
  "lastUpdateDate": "1965-08-07T18:30:00.000Z",
  "reqStatus": "REQ_APPROVED",
  "updateDate": "2017-10-02T05:36:20.632Z"
}
```

Paris receives this event
```
{
 "$class": "org.insurance.network.ReceiverRCDEvent",
 "rcdId": "145-145-898989-1256722",
 "insCoId": "145",
 "recInsCoId": "3142",
 "response": {
  "$class": "org.insurance.network.Response",
  "insCoId": "3142",
  "matchStatus": "FOUND",
  "matchLevel": "SUB_SSN",
  "contact": "800 Trinity Avenue Cambridge CB1 United Kingdom",
  "name": "Alicia Bead"
 },
 "eventId": "a6cd2436-df7c-4f97-bed8-15a8cf5adb7e#0",
 "timestamp": "2017-10-02T05:44:19.529Z"
}
```

Paris Ritz approves with GOOD_MATCH
```
{
  "$class": "org.insurance.network.authorizeRCD",
  "rcdId": "145-145-898989-1256722",
  "matchStatus": "FOUND",
  "insCoId": "145",
  "recInsCoId": "3142",
  "matchLevel": "GOOD_MATCH",
  "name": "Alicia Bead",
  "contact": "800 Trinity Avenue Cambridge CB1 United Kingdom"
}
```

RCD Rec
```
145-145-898989-1256722
{
  "$class": "org.insurance.network.RequestCustomerDetails",
  "reqCustDetId": "145-145-898989-1256722",
  "insCoId": "145",
  "responses": [
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "24",
      "matchStatus": "NOT_FOUND"
    },
    {
      "$class": "org.insurance.network.Response",
      "insCoId": "3142",
      "matchStatus": "FOUND",
      "matchLevel": "GOOD_MATCH",
      "contact": "800 Trinity Avenue Cambridge CB1 United Kingdom",
      "name": "Alicia Bead"
    }
  ],
  "name": "Alicia Bead",
  "contact": "442 College Close Oxford OX3 United Kingdom",
  "SSN": "",
  "dateOfBirth": "1965-08-07T18:30:00.000Z",
  "lastUpdateDate": "1965-08-07T18:30:00.000Z",
  "reqStatus": "REQ_APPROVED",
  "updateDate": "2017-10-02T05:36:20.632Z"
}
```

**LTC reimbursement**

**Scenario LTC 1**
Samuel Doleridge from Kingfisher Mutual (Ins co 3142) with policy number 1314507 makes a claim. 
enter LTC 
```
{
  "$class": "org.insurance.network.SubmitLTCReimbursement",
  "ltcRId": "1",
  "insPolId": "3142-223344-1314507",
  "fromDate": "2017-08-01",
  "toDate": "2017-01-11",
  "billNo": "AK47",
  "billAmt": 1500
}
```
Amt paid is 1000 as it is the min of amounts claimed.
LTC record
```
1
{
  "$class": "org.insurance.network.LTC",
  "ltcId": "1",
  "insCoId": "3142",
  "policy": "resource:org.insurance.network.InsPolicy#3142-223344-1314507",
  "fromDate": "2017-08-01T00:00:00.000Z",
  "toDate": "2017-08-11T00:00:00.000Z",
  "billNo": "123-14-4567-AK47",
  "billAmt": 1500,
  "totalAmtEligible": 1000,
  "claims": [],
  "ltcStatus": "SUBMITTED",
  "amtPaid": 1000
}
```

Submits in second company Bear Assurance
```
{
  "$class": "org.insurance.network.SubmitLTCReimbursement",
  "ltcRId": "2",
  "insPolId": "24-900022-56789",
  "fromDate": "2017-08-01",
  "toDate": "2017-08-11",
  "billNo": "AK47",
  "billAmt": 1500
}
```
Since Kingfisher has already paid 1000, Bear will pay only 500.
LTC record
```
2
{
  "$class": "org.insurance.network.LTC",
  "ltcId": "2",
  "insCoId": "24",
  "policy": "resource:org.insurance.network.InsPolicy#24-900022-56789",
  "fromDate": "2017-08-01T00:00:00.000Z",
  "toDate": "2017-08-11T00:00:00.000Z",
  "billNo": "123-14-4567-AK47",
  "billAmt": 1500,
  "totalAmtEligible": 1000,
  "claims": [
    {
      "$class": "org.insurance.network.InsCoClaim",
      "insCoId": "3142",
      "amtPaid": 1000
    }
  ],
  "ltcStatus": "SUBMITTED",
  "amtPaid": 500
}
```
**Scenario LTC 2**
Setup

John Paul cartre  from Kingfisher Mutual (Ins co 3142) with policy number 556678 makes a claim. 
enter LTC 
```
{
  "$class": "org.insurance.network.SubmitLTCReimbursement",
  "ltcRId": "3",
  "insPolId": "3142-456582-5566778",
  "fromDate": "2017-08-01",
  "toDate": "2017-08-11",
  "billNo": "M20",
  "billAmt": 3000
}
```
He is paid 1000 as that is his eligibility.
LTC record
```
3
{
  "$class": "org.insurance.network.LTC",
  "ltcId": "3",
  "insCoId": "3142",
  "policy": "resource:org.insurance.network.InsPolicy#3142-456582-5566778",
  "fromDate": "2017-08-01T00:00:00.000Z",
  "toDate": "2017-08-11T00:00:00.000Z",
  "billNo": "023-89-1093-M20",
  "billAmt": 3000,
  "totalAmtEligible": 1000,
  "claims": [],
  "ltcStatus": "SUBMITTED",
  "amtPaid": 1000
}
```

Now he goes to Maple Like (145) and submits the same bill.
```

  "$class": "org.insurance.network.SubmitLTCReimbursement",
  "ltcRId": "4",
  "insPolId": "145-4246-7234567",
  "fromDate": "2017-08-01",
  "toDate": "2017-08-11",
  "billNo": "M20",
  "billAmt": 3000
}
```
As his perDay limit at Maple Life is 200, he is paid 2000.
LTC record
```
4
{
  "$class": "org.insurance.network.LTC",
  "ltcId": "4",
  "insCoId": "145",
  "policy": "resource:org.insurance.network.InsPolicy#145-4246-7234567",
  "fromDate": "2017-08-01T00:00:00.000Z",
  "toDate": "2017-08-11T00:00:00.000Z",
  "billNo": "023-89-1093-M20",
  "billAmt": 3000,
  "totalAmtEligible": 2000,
  "claims": [
    {
      "$class": "org.insurance.network.InsCoClaim",
      "insCoId": "3142",
      "amtPaid": 1000
    }
  ],
  "ltcStatus": "SUBMITTED",
  "amtPaid": 2000
} 
```

The setup ends here.

He has already submitted the bill and got his 3000. 
Now he goes to Bear Assurance (24) and submits the same bill.
```

  "$class": "org.insurance.network.SubmitLTCReimbursement",
  "ltcRId": "5",
  "insPolId": "24-754321-12345",
  "fromDate": "2017-08-01",
  "toDate": "2017-08-11",
  "billNo": "M20",
  "billAmt": 3000
}
```
Though his elibilibity is 1000, as the other companies have already paid the full Bill amount of 3000, Bear Assurance pays nothing.
Do they put him on their watch list? :) 

LTC record
```
5
{
  "$class": "org.insurance.network.LTC",
  "ltcId": "5",
  "insCoId": "24",
  "policy": "resource:org.insurance.network.InsPolicy#24-754321-12345",
  "fromDate": "2017-08-01T00:00:00.000Z",
  "toDate": "2017-08-11T00:00:00.000Z",
  "billNo": "023-89-1093-M20",
  "billAmt": 3000,
  "totalAmtEligible": 1000,
  "claims": [
    {
      "$class": "org.insurance.network.InsCoClaim",
      "insCoId": "3142",
      "amtPaid": 1000
    },
    {
      "$class": "org.insurance.network.InsCoClaim",
      "insCoId": "145",
      "amtPaid": 2000
    }
  ],
  "ltcStatus": "SUBMITTED",
  "amtPaid": 0
}
```

An insurance regulator (system supervisor who oversees the insurance consortium system) can ask for the History records from a particular date to the current date by invoking the `GetTraceNomineeHist` transaction.










