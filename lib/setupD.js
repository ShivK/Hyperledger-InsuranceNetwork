
/**
 * Setup the demo for Insurance policies
 * @param {org.insurance.network.SetupDemoPolicies} setupDemo - the SetupDemo transaction for insurance policies
 * @transaction
 */
function setupDemoPolicies(setupDemo) {
    var factory = getFactory();
    var NS = 'org.insurance.network';
    //Insurance Policies
    //insCoId,insCustId,polNo,polStDT,polEndDt,sumAssured,isNomineeCust,[nomReln,nomName,nomSSN,nomDOB,nomContact],nomAddrUpdDt
    //dates in YYYYMMDD string
    InsPolA = [['145','12244','1258000','20000511','20200411',200000,'N',['DAUGHTER','Katy Malaparte','080-08-0800','19701214','2217 Eiffel Ave Wilmington Delaware DE 28401'],'20000411'],
        ['145','12244','1258001','20000511','20200411',200000,'N',['SON','Napolean Malaparte II','242-86-7010','19681210','2217 Eiffel Ave Wilmington Delaware DE 28401'],'20000411'],
        ['145','278945','820056','19920801','20220701',100000,'N',['SPOUSE','Indu Wryson','223-42-1980','19420707','21 Kingsbury Way Austin TX 78708'],'20010505'],
        ['145','898989','1256722','20051111','20251011',150000,'N',['SIBLING','Alicia Bead','','19650808','442 College Close Oxford OX3 United Kingdom'],'20090805'],
        ['3142','327450','1257000','20101111','20301111',50000,'N',['SIBLING','Alicia Bead','','19650808','800 Trinity Avenue Cambridge CB1 United Kingdom'],'20170415'],
        ['3142','223344','1314507','20010304','20210303',100000,'N',['SPOUSE','Martha Doleridge','042-12-4576','19560401','674 Church St Mountain View CA 94040'],'20170101'],
        ['24','900022','56789','20050108','20250107',100000,'N',['SPOUSE','Martha Doleridge','042-12-4576','19560401','674 Church St Mountain View CA 94040'],'20170101'],
        ['145','4246','7234567','20050102','20250101',100000,'N',['SON','Sean Paul Cartre','111-22-3333','19841201','90 Fifth Ave New York NY 10019'],'20160502'],
        ['3142','456582','5566778','20060102','20260101',100000,'N',['SON','Sean Paul Cartre','111-22-3333','19841201','90 Fifth Ave New York NY 10019'],'20160502'],
        ['24','754321','12345','20070102','20270101',100000,'N',['SON','Sean Paul Cartre','111-22-3333','19841201','90 Fifth Ave New York NY 10019'],'20160502']
    ]

    return getAssetRegistry(NS + '.InsPolicy')
    .then(function(registry) {
        var recs = []
        p = InsPolA

        for (i = 0; i < p.length; i++) {
            arec = p[i]
            //Construct insPolId
            polD = 
            key = arec[0] + "-" + arec[1] + "-" + arec[2];
            var rec = factory.newResource(NS, 'InsPolicy', key);
            rec.insCoId = arec[0];
            rec.insCoCustId = arec[1];
            rec.polNo = arec[2];
            dStr = arec[3];
            rec.polStartDate = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));
            dStr = arec[4];
            rec.polEndDate = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));
            rec.sumAssured = arec[5];
            if (arec[6] == 'N')
                rec.isNomineeCustomer = false
            else
                rec.isNomineeCustomer = true
            if (!rec.isNomineeCustomer) {
                //create nominee
                nom = arec[7]
                nominee  = factory.newConcept(NS, 'Nominee');
                nominee.nomReln = nom[0]
                nominee.nomName = nom[1]
                nominee.nomSSN = nom[2]
                dStr = nom[3]
                nominee.nomDateOfBirth = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));  
                nominee.nomContact = nom[4]
                rec.nom = nominee;
            }
            dstr = arec[8]
            rec.nomContactUpdateDate = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));  

            rec.nomineeContactable = 'OK';
            recs.push(rec);
        }
        //Five policies for LTCR - LTC reimb
        ltc = [5,6,7,8,9]
        ltcAmt = [100,100,200,100,100]
        for (n =0; n < ltc.length; n++) {
            recs[ltc[n]].optedLTC = true;
            recs[ltc[n]].amtLTCperDiem = ltcAmt[n];
        } 
        //One policy is closed - Margaret Beade
        recs[4].isClosed = true;
        
        return registry.addAll(recs);
    });
}

/**
 * Setup the demo for Insurance customers
 * @param {org.insurance.network.SetupDemoCust} setupDemo - the SetupDemo transaction for insurance customers
 * @transaction
 */
function setupDemoCust(setupDemo) {
    var factory = getFactory();
    var NS = 'org.insurance.network';
    //Insurance Customers
    //insCoId,insCoCustId,custName,Contact,SSN,DateOfBirh,dateUpdated,rightToShare
    //dates in YYYYMMDD string
    InsCustA = [['145','12244','Napolean Malaparte','2217 Eiffel Ave Wilmington Delaware DE 28401','221-12-4678','19480116','20000511','Y'],
    ['3142','223344','Samuel Doleridge','674 Church St Mountain View CA 94040','123-14-4567','19500409','20100110','Y'],
    ['145','898989','Margaret Bead','840 Winters Way Lewisville TX 75010','422-12-4511','19601111','20060606','Y'],
    ['145','4246','Jean Paul Cartre','90 Fifth Ave New York NY 10019','023-89-1093','19621121','20000201','N'],
    ['145','278945','Bill Wryson','21 Kingsbury Way Austin TX 78708','411-25-8907','19401225','20000505','Y'],
    ['24','890781','Katy Malaparte','42 Lexington Ave Washington DC 20002','080-08-0800','19701214','20121010','Y'],
    ['24','182567','Indira Bandhi','67 18th St Boston MA 01841','223-42-1980','19420707','20130807','Y'],
    ['24','900022','Samuel Doleridge','674 Church St Mountain View CA 94040','123-14-4567','19500409','20070205','Y'],
    ['3142','327450','Margaret Bead','840 Winters Way Lewisville TX 75010','422-12-4511','19601111','20100102','Y'],
    ['3142','456582','Jean Paul Cartre','90 Fifth Ave New York NY 10019','023-89-1093','19621121','20010201','Y'],
    ['3142','128927','Napolean Malaparte II','425 Hyacinth Way  Miami FL  33018','242-86-7010','19681210','20090108','N'],
    ['24','754321','Jean Paul Cartre','90 Fifth Ave New York NY 10019','023-89-1093','19621121','20020201','Y']
    ]

    return getAssetRegistry(NS + '.InsuranceCustomer')
    .then(function(registry) {
        var recs = []
        p = InsCustA
        
        for (i = 0; i < p.length; i++) {
            arec = p[i]
            //Construct insCustId
            key = arec[0] + "-" + arec[1]
            var rec = factory.newResource(NS, 'InsuranceCustomer', key);
            //rec.insCoId = factory.newRelationship(NS, 'InsuranceCompany', arec[0]);
            rec.insCoId = arec[0];
            rec.insCoCustId = arec[1];
            rec.custName = arec[2];0,2,4,8
            rec.Contact = arec[3];
            rec.SSN = arec[4];
            dStr = arec[5];
            rec.DateOfBirth = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));
            dStr = arec[6];
            rec.dateUpdated = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));
            var bv = false
            if (arec[7] == "Y")
                bv = true;
            rec.rightToShare = bv;
            rec.status = 'OK';
            recs.push(rec)
        }
        //Three people died, four records updated
        deadNo = [0,2,4,8]
        deadDates = ['20170324','20170315','20170303','20170315']
        for (n =0; n < deadNo.length; n++) {
            recs[deadNo[n]].isDead = true;
            dStr = deadDates[n]
            recs[deadNo[n]].DateOfDeath = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));
        }
        return registry.addAll(recs);
    });
}

/**
 * Setup the demo
 * @param {org.insurance.network.SetupDemoInsCo} setupDemo - the SetupDemo transaction for insurance companies
 * @transaction
 */
function setupDemoInsCo(setupDemo) {
    var factory = getFactory();
    var NS = 'org.insurance.network';

    InsCoA = [['145','Maple Life','204 South Sea Face Avenue Miami Florida  FL 33018',['24','3142']],
                ['24','Bear Assurance','400 Mountain Creek St, Cheyenne Wyoming WY 82001',['145','3142']],
                ['3142','Kingfisher Mutual Life','2233 El Camino Real Santa Clara CA 95050',['145','24']]
                ]   

    InsShrA = [['1','145','24','20150101','20250101'],
               ['2','24','3142','20140615','20190615'],
               ['3','145','3142','20140615','20190615']
            ]
    //Insurance Employees
    //insCoId,insEmpId,insEmpName,insEmpContact,insEmplevel
    InsEmpA= [['145','2007','Martina Wingis','martina.wingis@mapleleaf.com','MANAGER'],
                ['145','1001','Shashi Capoor','shashi.capoor@mapleleaf.com','AGENT'],
                ['24','9078','Karl Narx','karl9078@bearassurance.com','MANAGER'],
                ['24','8344','Angela Herkel','angela8344@bearassurance.com','AGENT'],
                ['3142','62667','Paris Ritz','pritz@kingfisherml.com','MANAGER'],
                ['3142','434343','Abbas Khan','akhan@kingfisherml.com','AGENT']
            ]


    return getParticipantRegistry(NS + '.InsuranceCompany')
    .then(function(registry) {
        var recs = []
        var recno = 0
        p = InsCoA
        for (i = 0; i < p.length; i++) {
            arec = p[i]
            var rec = factory.newResource(NS, 'InsuranceCompany', arec[0]);
            rec.insCoName = arec[1];
            rec.insCoContact = arec[2];
            rec.insAgree = arec[3];
            recs.push(rec)
        }
        return registry.addAll(recs);
    })
    .then(function() {
        return getParticipantRegistry(NS + '.InsuranceEmployee');
    })
    .then(function(registry) {
        var recs = []
        var recno = 0
        p = InsEmpA
        for (i = 0; i < p.length; i++) {
            arec = p[i]
            var rec = factory.newResource(NS, 'InsuranceEmployee', arec[1]);
            rec.insCoId = arec[0];
            rec.insEmpName = arec[2];
            rec.insEmpContact = arec[3];
            rec.insEmplevel = arec[4];
            recs.push(rec)
        }
        return registry.addAll(recs);
    })
    .then(function() {
        return getParticipantRegistry(NS + '.InsuranceRegulator');
    })
    .then(function(registry) {
        var recs = []
        var rec = factory.newResource(NS, 'InsuranceRegulator','REG_1');
        rec.regName = 'Insu Regtor'
        recs.push(rec)
        return registry.addAll(recs);
    })
    .then(function() {
        return getAssetRegistry(NS + '.InsSharingAgreement');
    })
    .then(function(registry) {
        var recs = []
        var recno = 0
        p = InsShrA
        for (i = 0; i < p.length; i++) {
            arec = p[i]
            var rec = factory.newResource(NS, 'InsSharingAgreement', arec[0]);
            rec.insCoIdA = arec[1];
            rec.insCoIdB = arec[2];
            dStr = arec[3];
            rec.startDate = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));
            dStr = arec[4];
            rec.endDate = new Date(dStr.substring(0,4),dStr.substring(4,6) - 1, dStr.substring(6,8));
            recs.push(rec)
        }
        return registry.addAll(recs);
    }) ; 
}

