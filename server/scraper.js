const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const SCHEMES_FILE = path.join(DATA_DIR, 'schemes.json');

// Seed data — comprehensive real government schemes as fallback
const SEED_SCHEMES = [
    {
        id: 'pm-kisan',
        name: 'PM Kisan Samman Nidhi Yojana',
        description: 'Under the PM-KISAN scheme, all landholding farmer families shall get income support of Rs.6000/- per year in three equal installments of Rs.2000/- each, directly into their bank accounts. The scheme aims to supplement financial needs of land-holding farmers.',
        category: 'Agriculture',
        eligibility: 'All landholding farmer families with cultivable land',
        state: 'All India',
        target: 'Farmers',
        benefits: [
            'Rs. 6,000 per year in three installments of Rs. 2,000',
            'Direct bank transfer — no intermediaries',
            'Covers all landholding farmer families',
            'No minimum land holding requirement'
        ],
        documents: ['Aadhaar Card', 'Land ownership records', 'Bank account passbook', 'Mobile number linked to Aadhaar'],
        steps: [
            'Visit the PM-KISAN portal or nearest CSC center',
            'Register with Aadhaar number and land details',
            'Submit required documents for verification',
            'State government verifies land ownership',
            'Amount credited directly to bank account'
        ],
        deadline: 'Ongoing — Rolling enrollment',
        sourceUrl: 'https://pmkisan.gov.in'
    },
    {
        id: 'pmjay',
        name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PMJAY)',
        description: 'AB-PMJAY provides health cover of Rs. 5 lakh per family per year for secondary and tertiary care hospitalization. It is the world\'s largest health insurance scheme and covers over 12 crore poor and vulnerable families.',
        category: 'Healthcare',
        eligibility: 'Bottom 40% of Indian population based on SECC data',
        state: 'All India',
        target: 'General',
        benefits: [
            'Health cover of Rs. 5 lakh per family per year',
            'Cashless and paperless treatment at empaneled hospitals',
            'Covers 3 days pre-hospitalization and 15 days post-hospitalization expenses',
            'No cap on family size, age, or gender',
            'Covers over 1,500 medical procedures'
        ],
        documents: ['Aadhaar Card', 'Ration Card', 'SECC database inclusion proof', 'Family ID'],
        steps: [
            'Check eligibility on mera.pmjay.gov.in',
            'Visit nearest Common Service Center (CSC) or empaneled hospital',
            'Submit identity documents for e-KYC',
            'Receive Ayushman Card',
            'Get cashless treatment at any empaneled hospital'
        ],
        deadline: 'Ongoing — No deadline',
        sourceUrl: 'https://pmjay.gov.in'
    },
    {
        id: 'mudra',
        name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
        description: 'PMMY provides loans up to Rs. 10 lakh to non-corporate, non-farm small/micro enterprises. Loans are available under three categories: Shishu (up to Rs. 50,000), Kishore (Rs. 50,001 to Rs. 5 lakh), and Tarun (Rs. 5,00,001 to Rs. 10 lakh).',
        category: 'Business',
        eligibility: 'Any Indian citizen with a business plan for non-farm income generating activity',
        state: 'All India',
        target: 'Entrepreneurs',
        benefits: [
            'Collateral-free loans up to Rs. 10 lakh',
            'Three categories: Shishu, Kishore, Tarun',
            'Available from banks, NBFCs, and MFIs',
            'No processing fee',
            'MUDRA card for working capital needs'
        ],
        documents: ['Identity proof (Aadhaar/Voter ID/Passport)', 'Address proof', 'Business plan/proposal', 'Last 2 years\' balance sheet', 'Caste certificate (if applicable)'],
        steps: [
            'Prepare a business plan',
            'Visit any bank, NBFC, or MFI branch',
            'Fill the MUDRA loan application form',
            'Submit required documents',
            'Loan sanctioned and disbursed within 7-10 days'
        ],
        deadline: 'Ongoing — No deadline',
        sourceUrl: 'https://www.mudra.org.in'
    },
    {
        id: 'scholarship',
        name: 'National Scholarship Portal (NSP)',
        description: 'The NSP is a one-stop platform for scholarship schemes provided by the Central Government, State Government, and UGC. It covers pre-matric, post-matric, and merit-cum-means based scholarships for students from economically weaker sections.',
        category: 'Education',
        eligibility: 'Students enrolled in recognized institutions meeting income & merit criteria',
        state: 'All India',
        target: 'Students',
        benefits: [
            'Scholarships ranging from Rs. 5,000 to Rs. 50,000 per year',
            'Covers tuition fees and maintenance allowance',
            'Available from Class 1 to PhD level',
            'Direct Benefit Transfer ensures timely payment',
            'Multiple scholarship schemes under one portal'
        ],
        documents: ['Aadhaar Card', 'Income Certificate', 'Caste Certificate (if applicable)', 'Previous year marksheet', 'Bank account details', 'Institution verification letter'],
        steps: [
            'Register on the National Scholarship Portal (scholarships.gov.in)',
            'Fill in academic and personal details',
            'Upload required documents',
            'Submit application to institution for verification',
            'District and State level verification follows',
            'Scholarship amount disbursed to bank account'
        ],
        deadline: 'February 28, 2026 (for current cycle)',
        sourceUrl: 'https://scholarships.gov.in'
    },
    {
        id: 'vishwakarma',
        name: 'PM Vishwakarma Yojana',
        description: 'PM Vishwakarma provides end-to-end support to artisans and craftspeople through recognition, skill upgradation, toolkit incentive, credit support, and market linkage. It covers 18 traditional trades including carpentry, blacksmithing, pottery, and tailoring.',
        category: 'Skill Development',
        eligibility: 'Traditional artisans and craftspeople working with hands and tools',
        state: 'All India',
        target: 'Workers',
        benefits: [
            'PM Vishwakarma Certificate and ID Card',
            'Skill training: Basic (5-7 days) and Advanced (15 days)',
            'Toolkit incentive of Rs. 15,000',
            'Collateral-free credit up to Rs. 3 lakh at 5% interest',
            'Digital transaction incentive and marketing support'
        ],
        documents: ['Aadhaar Card', 'Mobile number linked to Aadhaar', 'Bank account details', 'Proof of traditional trade/craft'],
        steps: [
            'Register at nearest CSC or pmvishwakarma.gov.in',
            'Verification by Gram Panchayat/ULB',
            'Receive PM Vishwakarma Certificate',
            'Enroll for skill training',
            'Apply for toolkit and credit support'
        ],
        deadline: 'March 31, 2026',
        sourceUrl: 'https://pmvishwakarma.gov.in'
    },
    {
        id: 'atal-pension',
        name: 'Atal Pension Yojana (APY)',
        description: 'APY guarantees a minimum pension of Rs. 1,000 to Rs. 5,000 per month after 60 years of age. The contribution depends on the pension amount chosen and the age of joining. Government co-contributes 50% of subscriber contribution.',
        category: 'Pension',
        eligibility: 'Indian citizens aged 18-40 years with a bank account',
        state: 'All India',
        target: 'Senior Citizens',
        benefits: [
            'Guaranteed monthly pension of Rs. 1,000 to Rs. 5,000',
            'Government co-contribution of 50% for eligible subscribers',
            'Spouse continues to receive pension after death',
            'Nominees receive accumulated pension wealth',
            'Tax benefits under Section 80CCD'
        ],
        documents: ['Aadhaar Card', 'Bank account', 'Mobile number'],
        steps: [
            'Visit your bank branch or use net banking',
            'Fill the APY registration form',
            'Choose pension amount (Rs. 1,000 to Rs. 5,000)',
            'Set up auto-debit from savings account',
            'Receive confirmation and PRAN number'
        ],
        deadline: 'Ongoing — Enroll before age 40',
        sourceUrl: 'https://www.npscra.nsdl.co.in/scheme-details.php'
    },
    {
        id: 'pmay',
        name: 'Pradhan Mantri Awas Yojana (PMAY)',
        description: 'PMAY aims to provide affordable housing to the urban and rural poor. It provides interest subsidy on home loans and financial assistance for construction of pucca houses with basic amenities.',
        category: 'Housing',
        eligibility: 'Economically weaker sections and low-income groups without pucca house',
        state: 'All India',
        target: 'General',
        benefits: [
            'Interest subsidy of 6.5% on home loans up to Rs. 6 lakh',
            'Financial assistance of Rs. 1.20 lakh to Rs. 2.50 lakh for construction',
            'Houses with basic amenities: toilet, electricity, water, kitchen',
            'Housing for all by 2026 mission'
        ],
        documents: ['Aadhaar Card', 'Income Certificate', 'No-home ownership certificate', 'Bank account details', 'Land ownership proof (for rural)'],
        steps: [
            'Check eligibility on pmaymis.gov.in',
            'Apply online or through CSC/ULB/Gram Panchayat',
            'Submit required documents',
            'Verification by local authority',
            'Subsidy/assistance credited to beneficiary account'
        ],
        deadline: 'December 31, 2026',
        sourceUrl: 'https://pmaymis.gov.in'
    },
    {
        id: 'ujjwala',
        name: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
        description: 'PMUY provides free LPG connections to women from BPL households. It aims to safeguard the health of women and children by providing clean cooking fuel, reducing indoor air pollution from traditional biomass fuels.',
        category: 'Energy',
        eligibility: 'Women from BPL households aged 18 years or above',
        state: 'All India',
        target: 'General',
        benefits: [
            'Free LPG connection with security deposit for cylinder and regulator',
            'First refill and hot plate provided free',
            'EMI facility for purchase of stove and first refill',
            'Reduces indoor air pollution and health hazards'
        ],
        documents: ['Aadhaar Card', 'BPL certificate/Ration Card', 'Bank account details', 'Passport-size photograph'],
        steps: [
            'Visit nearest LPG distributor',
            'Fill the PMUY application form',
            'Submit required documents',
            'Verification and approval',
            'Receive free LPG connection'
        ],
        deadline: 'Ongoing',
        sourceUrl: 'https://www.pmujjwalayojana.com'
    },
    {
        id: 'sukanya',
        name: 'Sukanya Samriddhi Yojana (SSY)',
        description: 'SSY is a government-backed savings scheme for the girl child that offers high interest rates and tax benefits. Parents can open an account for a girl child below 10 years with a minimum deposit of Rs. 250 per year.',
        category: 'Savings & Investment',
        eligibility: 'Parents/guardians of girl child below 10 years of age',
        state: 'All India',
        target: 'Students',
        benefits: [
            'High interest rate of 8.2% per annum (current)',
            'Tax exemption under Section 80C on deposits up to Rs. 1.5 lakh',
            'Interest and maturity amount fully tax-free',
            'Partial withdrawal allowed after girl turns 18 for education',
            'Account matures after 21 years or marriage after 18'
        ],
        documents: ['Birth certificate of girl child', 'Parent/guardian identity proof', 'Address proof', 'Passport-size photographs'],
        steps: [
            'Visit any post office or authorized bank',
            'Fill the SSY account opening form',
            'Make initial deposit (minimum Rs. 250)',
            'Receive passbook and account details',
            'Deposit minimum Rs. 250 per year to keep account active'
        ],
        deadline: 'Ongoing — Open before girl turns 10',
        sourceUrl: 'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89'
    },
    {
        id: 'pm-svanidhi',
        name: 'PM Street Vendor\'s AtmaNirbhar Nidhi (PM SVANidhi)',
        description: 'PM SVANidhi provides affordable working capital loans to street vendors. First loan of Rs. 10,000, second of Rs. 20,000, and third of Rs. 50,000 with interest subsidy of 7%. It also promotes digital transactions.',
        category: 'Business',
        eligibility: 'Street vendors with vending certificate/Letter of Recommendation',
        state: 'All India',
        target: 'Entrepreneurs',
        benefits: [
            'Working capital loan up to Rs. 50,000 in three tranches',
            'Interest subsidy of 7%',
            'Monthly cashback on digital transactions',
            'No collateral required',
            'Quick disbursement'
        ],
        documents: ['Aadhaar Card', 'Vending Certificate or Letter of Recommendation', 'Bank account details', 'Passport-size photograph'],
        steps: [
            'Apply on pmsvanidhi.mohua.gov.in or through bank',
            'Submit vending certificate',
            'Bank processes and approves loan',
            'Loan disbursed to bank account',
            'Repay in 12 monthly installments'
        ],
        deadline: 'December 2026',
        sourceUrl: 'https://pmsvanidhi.mohua.gov.in'
    },
    {
        id: 'kcc',
        name: 'Kisan Credit Card (KCC)',
        description: 'KCC provides timely and adequate credit to farmers for agricultural and allied activities. It covers crop cultivation, post-harvest expenses, farm asset maintenance, and consumption needs of farmer households.',
        category: 'Agriculture',
        eligibility: 'All farmers — individual, joint borrowers, tenant farmers, sharecroppers',
        state: 'All India',
        target: 'Farmers',
        benefits: [
            'Credit limit up to Rs. 3 lakh at subsidized interest rate of 4%',
            'Flexible repayment schedule aligned with crop season',
            'ATM-enabled card for easy access to funds',
            'Crop insurance cover under PMFBY',
            'Personal accident insurance of Rs. 50,000'
        ],
        documents: ['Identity proof', 'Address proof', 'Land ownership/tenure documents', 'Passport-size photograph', 'Crop sowing certificate'],
        steps: [
            'Visit nearest bank branch',
            'Fill KCC application form',
            'Submit land and identity documents',
            'Bank verifies and grants credit limit',
            'Receive KCC card and passbook'
        ],
        deadline: 'Ongoing',
        sourceUrl: 'https://pmkisan.gov.in'
    },
    {
        id: 'pmegp',
        name: 'Prime Minister\'s Employment Generation Programme (PMEGP)',
        description: 'PMEGP provides credit-linked subsidy for setting up micro-enterprises in the non-farm sector. Maximum project cost is Rs. 50 lakh for manufacturing and Rs. 20 lakh for service sector. Subsidy ranges from 15% to 35%.',
        category: 'Business',
        eligibility: 'Individuals above 18 years. For projects above Rs. 10 lakh, minimum 8th pass',
        state: 'All India',
        target: 'Entrepreneurs',
        benefits: [
            'Subsidy of 15% to 35% of project cost',
            'Maximum project cost Rs. 50 lakh (manufacturing)',
            'Maximum project cost Rs. 20 lakh (service)',
            'Higher subsidy for SC/ST/Women/NE region applicants',
            'Second loan available for expansion'
        ],
        documents: ['Project report', 'Educational certificates', 'Caste certificate (if applicable)', 'Rural area certificate', 'Bank passbook', 'Aadhaar Card'],
        steps: [
            'Apply online on kviconline.gov.in',
            'KVIC/DIC forwards application to bank',
            'Bank appraises the project',
            'Loan sanctioned with margin money subsidy',
            'Start operations and apply for subsidy release'
        ],
        deadline: 'Ongoing — year-round applications',
        sourceUrl: 'https://www.kviconline.gov.in/pmegp/pmegpweb/index.jsp'
    },
    {
        id: 'stand-up-india',
        name: 'Stand-Up India Scheme',
        description: 'Stand-Up India facilitates bank loans between Rs. 10 lakh and Rs. 1 crore to SC/ST and Women entrepreneurs for setting up greenfield enterprises in manufacturing, services, or trading sector.',
        category: 'Business',
        eligibility: 'SC/ST or Women entrepreneurs above 18 years for greenfield enterprise',
        state: 'All India',
        target: 'Entrepreneurs',
        benefits: [
            'Loans from Rs. 10 lakh to Rs. 1 crore',
            'Covers up to 75% of project cost',
            'Repayment period up to 7 years',
            'Margin money of 25%',
            'Handholding support for enterprise setup'
        ],
        documents: ['Identity proof', 'Address proof', 'Caste/Category certificate', 'Project report', 'Business plan'],
        steps: [
            'Apply on standupmitra.in portal',
            'Submit project report to bank',
            'Bank appraises project viability',
            'Loan sanctioned and disbursed',
            'Start enterprise operations'
        ],
        deadline: 'Ongoing',
        sourceUrl: 'https://www.standupmitra.in'
    },
    {
        id: 'pmfby',
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'PMFBY provides comprehensive crop insurance at very low premium rates: 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops. It covers yield losses, prevented sowing, and post-harvest losses.',
        category: 'Agriculture',
        eligibility: 'All farmers (loanee and non-loanee) growing notified crops',
        state: 'All India',
        target: 'Farmers',
        benefits: [
            'Very low premium: 2% Kharif, 1.5% Rabi, 5% Commercial',
            'Full sum insured for total crop loss',
            'Coverage for prevented sowing/planting',
            'Post-harvest loss coverage for 14 days',
            'Technology-driven claims with satellite imagery and drones'
        ],
        documents: ['Land records', 'Sowing certificate', 'Bank account details', 'Aadhaar Card', 'Crop details'],
        steps: [
            'Register on PMFBY portal or through bank/CSC',
            'Pay premium amount',
            'Declare crop details and sowing area',
            'In case of crop loss, file claim within 72 hours',
            'Claim assessed and paid to bank account'
        ],
        deadline: 'Season-wise enrollment deadlines',
        sourceUrl: 'https://pmfby.gov.in'
    },
    {
        id: 'nps',
        name: 'National Pension System (NPS)',
        description: 'NPS is a voluntary retirement savings scheme that allows subscribers to build a retirement corpus. It offers market-linked returns through professional fund management with tax benefits up to Rs. 2 lakh under Sections 80C and 80CCD.',
        category: 'Pension',
        eligibility: 'Any Indian citizen aged 18-70 years',
        state: 'All India',
        target: 'Senior Citizens',
        benefits: [
            'Tax deduction up to Rs. 2 lakh (Rs. 1.5L under 80C + Rs. 50K under 80CCD(1B))',
            'Market-linked returns through professional fund management',
            '60% of corpus tax-free withdrawal at retirement',
            '40% used for annuity (pension)',
            'Flexible contribution — no minimum monthly requirement'
        ],
        documents: ['PAN Card', 'Aadhaar Card', 'Bank account details', 'Passport-size photograph'],
        steps: [
            'Open NPS account on enps.nsdl.com or through bank/POP',
            'Complete e-KYC with Aadhaar',
            'Receive PRAN (Permanent Retirement Account Number)',
            'Make contributions online or through bank',
            'Choose pension fund manager and asset allocation'
        ],
        deadline: 'Ongoing — Enroll before age 70',
        sourceUrl: 'https://www.npscra.nsdl.co.in'
    },
    {
        id: 'digital-india',
        name: 'Digital India — PMGDISHA',
        description: 'Pradhan Mantri Gramin Digital Saksharta Abhiyan (PMGDISHA) aims to make 6 crore rural households digitally literate. Training covers operating digital devices, internet browsing, e-governance services, and digital payment.',
        category: 'Digital Literacy',
        eligibility: 'One member per eligible rural household aged 14-60 years',
        state: 'All India',
        target: 'General',
        benefits: [
            'Free digital literacy training (20 hours)',
            'Certification from government-approved agency',
            'Learn to use smartphones, tablets, and computers',
            'Training on digital payments and e-governance',
            'Access to nearest training center'
        ],
        documents: ['Aadhaar Card', 'Age proof', 'Address proof'],
        steps: [
            'Find nearest training center on pmgdisha.in',
            'Register as a candidate',
            'Complete 20-hour training program',
            'Pass the online assessment',
            'Receive digital literacy certificate'
        ],
        deadline: 'March 2026',
        sourceUrl: 'https://www.pmgdisha.in'
    },
    {
        id: 'jan-dhan',
        name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
        description: 'PMJDY provides universal access to banking services with at least one basic bank account for every household. It includes RuPay debit card, Rs. 2 lakh accident insurance, Rs. 30,000 life insurance, and overdraft facility.',
        category: 'Banking',
        eligibility: 'Any Indian citizen who does not have a bank account',
        state: 'All India',
        target: 'General',
        benefits: [
            'Zero balance bank account',
            'RuPay debit card with Rs. 2 lakh accident insurance',
            'Rs. 30,000 life insurance cover',
            'Overdraft facility of Rs. 10,000',
            'Direct Benefit Transfer (DBT) for government subsidies'
        ],
        documents: ['Aadhaar Card or any identity proof', 'Passport-size photograph'],
        steps: [
            'Visit any bank branch or banking correspondent',
            'Fill simplified account opening form',
            'Submit identity proof',
            'Receive passbook and RuPay card',
            'Start using the account for DBT and savings'
        ],
        deadline: 'Ongoing',
        sourceUrl: 'https://pmjdy.gov.in'
    },
    {
        id: 'startup-india',
        name: 'Startup India Seed Fund Scheme',
        description: 'The scheme provides financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization. Grants up to Rs. 20 lakh for validation and Rs. 50 lakh for market launch.',
        category: 'Business',
        eligibility: 'DPIIT-recognized startups incorporated within 2 years',
        state: 'All India',
        target: 'Entrepreneurs',
        benefits: [
            'Grant up to Rs. 20 lakh for proof of concept and validation',
            'Debt/convertible debentures up to Rs. 50 lakh for market entry',
            'No equity dilution for grants',
            'Incubator support and mentorship',
            'Access to Startup India ecosystem'
        ],
        documents: ['DPIIT recognition certificate', 'Company registration documents', 'Business plan', 'Bank account details', 'Founder Aadhaar/PAN'],
        steps: [
            'Get DPIIT recognition on startupindia.gov.in',
            'Apply through DPIIT-approved incubator',
            'Incubator evaluates and recommends',
            'Expert Advisory Committee reviews application',
            'Fund disbursed through incubator'
        ],
        deadline: 'Ongoing — through approved incubators',
        sourceUrl: 'https://seedfund.startupindia.gov.in'
    },
    {
        id: 'matru-vandana',
        name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
        description: 'PMMVY provides maternity benefit of Rs. 5,000 in three installments to pregnant women and lactating mothers for the first living child. The remaining Rs. 1,000 is provided through JSY for institutional delivery.',
        category: 'Healthcare',
        eligibility: 'Pregnant women and lactating mothers for first living child',
        state: 'All India',
        target: 'General',
        benefits: [
            'Cash incentive of Rs. 5,000 in three installments',
            'Additional Rs. 1,000 through JSY for institutional delivery',
            'Nutritional support during pregnancy',
            'Partial compensation for wage loss during pregnancy',
            'Promotes institutional delivery'
        ],
        documents: ['Aadhaar Card', 'Bank/Post Office account', 'MCP Card', 'Pregnancy registration proof'],
        steps: [
            'Register at nearest Anganwadi Centre or health facility',
            'Fill PMMVY application form',
            'Submit MCP card and pregnancy proof',
            'First installment after pregnancy registration',
            'Subsequent installments after ANC visits and child registration'
        ],
        deadline: 'Ongoing',
        sourceUrl: 'https://pmmvy.wcd.gov.in'
    },
    {
        id: 'skill-india',
        name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
        description: 'PMKVY is the flagship skill development scheme that provides free short-term skill training (150-300 hours) with certification, assessment allowance, and placement support to Indian youth.',
        category: 'Skill Development',
        eligibility: 'Indian nationals who are Class 10 dropouts or unemployed',
        state: 'All India',
        target: 'Workers',
        benefits: [
            'Free skill training in 40+ sectors',
            'Assessment and certification by government',
            'Training allowance and post-placement support',
            'Recognition of Prior Learning (RPL)',
            'Industry-relevant curriculum'
        ],
        documents: ['Aadhaar Card', 'Educational certificates', 'Bank account details', 'Passport-size photograph'],
        steps: [
            'Find nearest training center on pmkvyofficial.org',
            'Enroll in desired skill course',
            'Complete training of 150-300 hours',
            'Pass assessment exam',
            'Receive certification and placement assistance'
        ],
        deadline: 'Ongoing — year-round enrollment',
        sourceUrl: 'https://www.pmkvyofficial.org'
    }
];

/**
 * Attempt to scrape scheme data from myscheme.gov.in
 * Falls back to seed data if scraping fails
 */
async function scrapeSchemes() {
    console.log('[Scraper] Starting scheme scrape from myscheme.gov.in...');

    try {
        // myScheme.gov.in uses a Next.js API. Try fetching from their page data endpoint
        const schemes = [];

        // Try multiple categories of scheme pages
        const categories = [
            'https://www.myscheme.gov.in/search/category/agriculture',
            'https://www.myscheme.gov.in/search/category/education',
            'https://www.myscheme.gov.in/search/category/health',
            'https://www.myscheme.gov.in/search/category/business',
            'https://www.myscheme.gov.in/search/category/housing',
            'https://www.myscheme.gov.in/search/category/social-welfare',
        ];

        for (const url of categories) {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    },
                    timeout: 10000,
                });

                const $ = cheerio.load(response.data);

                // Try to extract scheme data from Next.js __NEXT_DATA__ script
                const nextDataScript = $('script#__NEXT_DATA__').html();
                if (nextDataScript) {
                    try {
                        const nextData = JSON.parse(nextDataScript);
                        const pageProps = nextData?.props?.pageProps;
                        if (pageProps?.schemes || pageProps?.data) {
                            const schemeList = pageProps.schemes || pageProps.data || [];
                            for (const s of schemeList) {
                                schemes.push({
                                    id: s.slug || s.id || `scraped-${schemes.length}`,
                                    name: s.schemeName || s.name || s.title || 'Unknown Scheme',
                                    description: s.briefDescription || s.description || s.overview || '',
                                    category: s.category || s.nodalMinistryName || 'General',
                                    eligibility: s.eligibility || s.targetBeneficiaries || '',
                                    state: s.state || s.level || 'All India',
                                    target: s.targetBeneficiaries || 'General',
                                    benefits: Array.isArray(s.benefits) ? s.benefits : (s.benefits ? [s.benefits] : []),
                                    documents: Array.isArray(s.documentsRequired) ? s.documentsRequired : [],
                                    steps: Array.isArray(s.applicationProcess) ? s.applicationProcess : (s.applicationProcess ? [s.applicationProcess] : []),
                                    deadline: s.deadline || 'Check official website',
                                    sourceUrl: s.sourceUrl || `https://www.myscheme.gov.in/schemes/${s.slug || ''}`,
                                });
                            }
                        }
                    } catch (parseErr) {
                        console.log(`[Scraper] Could not parse Next.js data from ${url}`);
                    }
                }

                // Also try to scrape scheme cards from the HTML directly
                $('[class*="scheme-card"], [class*="SchemeCard"], a[href*="/schemes/"]').each((i, el) => {
                    const name = $(el).find('h3, h4, [class*="title"]').first().text().trim();
                    const desc = $(el).find('p, [class*="description"]').first().text().trim();
                    const href = $(el).attr('href') || $(el).find('a').first().attr('href');
                    if (name && name.length > 3) {
                        const slug = href ? href.split('/').pop() : `scraped-${schemes.length}`;
                        // Avoid duplicates
                        if (!schemes.find(s => s.name === name)) {
                            schemes.push({
                                id: slug,
                                name,
                                description: desc || 'Government welfare scheme',
                                category: url.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                eligibility: 'Check official website for eligibility',
                                state: 'All India',
                                target: 'General',
                                benefits: [],
                                documents: [],
                                steps: [],
                                deadline: 'Check official website',
                                sourceUrl: href ? `https://www.myscheme.gov.in${href}` : url,
                            });
                        }
                    }
                });

                console.log(`[Scraper] Fetched from ${url}: found schemes so far: ${schemes.length}`);
            } catch (err) {
                console.log(`[Scraper] Failed to fetch ${url}: ${err.message}`);
            }
        }

        if (schemes.length > 0) {
            console.log(`[Scraper] Successfully scraped ${schemes.length} schemes`);
            saveSchemes(schemes);
            return schemes;
        }

        // Fallback: try to scrape individual scheme detail pages for richer data
        console.log('[Scraper] No bulk data found, trying alternate approach...');
    } catch (err) {
        console.log(`[Scraper] Scrape failed: ${err.message}`);
    }

    // Fallback to seed data
    console.log(`[Scraper] Using seed data (${SEED_SCHEMES.length} schemes)`);
    saveSchemes(SEED_SCHEMES);
    return SEED_SCHEMES;
}

/**
 * Load schemes from cached file, or scrape if none exist
 */
async function loadSchemes() {
    if (fs.existsSync(SCHEMES_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(SCHEMES_FILE, 'utf-8'));
            if (data.length > 0) {
                console.log(`[Data] Loaded ${data.length} schemes from cache`);
                return data;
            }
        } catch (err) {
            console.log('[Data] Cache corrupted, re-scraping...');
        }
    }
    return await scrapeSchemes();
}

/**
 * Save schemes to JSON cache
 */
function saveSchemes(schemes) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SCHEMES_FILE, JSON.stringify(schemes, null, 2));
    console.log(`[Data] Saved ${schemes.length} schemes to ${SCHEMES_FILE}`);
}

module.exports = { scrapeSchemes, loadSchemes, SEED_SCHEMES };
