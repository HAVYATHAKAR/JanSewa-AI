const fs = require('fs');
const path = require('path');

// Base schemes by category with templates for generating variations
const MINISTRIES = {
    'Agriculture': { icon: '🌾', targets: ['Farmers', 'Agricultural Workers'] },
    'Education': { icon: '📚', targets: ['Students', 'Teachers'] },
    'Healthcare': { icon: '🏥', targets: ['General', 'Women', 'Senior Citizens'] },
    'Business': { icon: '💼', targets: ['Entrepreneurs', 'MSMEs', 'Startups'] },
    'Housing': { icon: '🏠', targets: ['General', 'Urban Poor', 'Rural'] },
    'Social Welfare': { icon: '🤝', targets: ['SC/ST', 'OBC', 'Minorities', 'General'] },
    'Women & Child': { icon: '👩', targets: ['Women', 'Children'] },
    'Skill Development': { icon: '🔧', targets: ['Workers', 'Youth', 'Unemployed'] },
    'Energy': { icon: '⚡', targets: ['General', 'Rural', 'Farmers'] },
    'Banking & Finance': { icon: '🏦', targets: ['General', 'Entrepreneurs', 'Workers'] },
    'Pension & Insurance': { icon: '🛡', targets: ['Senior Citizens', 'Workers', 'General'] },
    'Digital India': { icon: '💻', targets: ['General', 'Students', 'Rural'] },
    'Rural Development': { icon: '🏘', targets: ['Rural', 'Farmers', 'Workers'] },
    'Urban Development': { icon: '🏙', targets: ['Urban Poor', 'General'] },
    'Transport': { icon: '🚌', targets: ['General', 'Workers'] },
    'Defence & Veterans': { icon: '🎖', targets: ['Ex-Servicemen', 'Defence Personnel'] },
    'Labour & Employment': { icon: '👷', targets: ['Workers', 'Unemployed', 'Labour'] },
    'Science & Technology': { icon: '🔬', targets: ['Students', 'Researchers'] },
    'Environment': { icon: '🌿', targets: ['General', 'Farmers', 'Rural'] },
    'Tribal Welfare': { icon: '🏔', targets: ['Tribal', 'SC/ST'] },
    'Minority Affairs': { icon: '📿', targets: ['Minorities'] },
    'Fisheries': { icon: '🐟', targets: ['Fishermen', 'Farmers'] },
    'Textiles': { icon: '🧵', targets: ['Workers', 'Artisans'] },
    'Food & Distribution': { icon: '🍚', targets: ['BPL Families', 'General'] },
    'Sports & Youth': { icon: '🏅', targets: ['Students', 'Youth', 'Athletes'] },
};

const STATES = ['All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'];

// Comprehensive real schemes data
const SCHEMES = [
    // ===== AGRICULTURE (50+ schemes) =====
    { id: 'pm-kisan', name: 'PM Kisan Samman Nidhi Yojana', desc: 'Financial assistance of Rs.6000/year in three installments to farmer families with cultivable land.', cat: 'Agriculture', elig: 'All landholding farmer families', state: 'All India', target: 'Farmers', benefits: ['Rs.6,000/year in 3 installments', 'Direct bank transfer', 'No minimum land holding'], docs: ['Aadhaar Card', 'Land records', 'Bank passbook'], deadline: 'Ongoing', url: 'https://pmkisan.gov.in' },
    { id: 'pmfby', name: 'PM Fasal Bima Yojana', desc: 'Crop insurance at low premiums: 2% Kharif, 1.5% Rabi, 5% commercial crops.', cat: 'Agriculture', elig: 'All farmers growing notified crops', state: 'All India', target: 'Farmers', benefits: ['Low premium crop insurance', 'Post-harvest loss coverage', 'Technology-driven claims'], docs: ['Land records', 'Sowing certificate', 'Aadhaar'], deadline: 'Season-wise', url: 'https://pmfby.gov.in' },
    { id: 'kcc', name: 'Kisan Credit Card', desc: 'Credit up to Rs.3 lakh at 4% interest for crop cultivation and farm needs.', cat: 'Agriculture', elig: 'All farmers including tenant farmers', state: 'All India', target: 'Farmers', benefits: ['Credit up to Rs.3 lakh at 4%', 'ATM-enabled card', 'Crop insurance cover'], docs: ['Identity proof', 'Land documents', 'Photo'], deadline: 'Ongoing', url: 'https://pmkisan.gov.in' },
    { id: 'soil-health', name: 'Soil Health Card Scheme', desc: 'Provides soil health cards to farmers with crop-wise nutrient recommendations.', cat: 'Agriculture', elig: 'All farmers', state: 'All India', target: 'Farmers', benefits: ['Free soil testing', 'Crop-wise nutrient advice', 'Improved crop yields'], docs: ['Land ownership proof', 'Aadhaar'], deadline: 'Ongoing', url: 'https://soilhealth.dac.gov.in' },
    { id: 'pmksy', name: 'PM Krishi Sinchai Yojana', desc: 'Ensures access to irrigation with "Har Khet Ko Pani" and promotes micro-irrigation.', cat: 'Agriculture', elig: 'All farmers', state: 'All India', target: 'Farmers', benefits: ['Micro-irrigation subsidy', 'Per drop more crop', 'Water use efficiency'], docs: ['Land records', 'Bank account'], deadline: 'Ongoing', url: 'https://pmksy.gov.in' },
    { id: 'enam', name: 'e-NAM (National Agriculture Market)', desc: 'Online trading platform for agricultural commodities across India.', cat: 'Agriculture', elig: 'Farmers, traders, commission agents', state: 'All India', target: 'Farmers', benefits: ['Transparent price discovery', 'Online trading', 'Better price realization'], docs: ['Aadhaar', 'Bank account', 'Mandi license'], deadline: 'Ongoing', url: 'https://enam.gov.in' },
    { id: 'paramparagat', name: 'Paramparagat Krishi Vikas Yojana', desc: 'Promotes organic farming through cluster approach with Rs.50,000/ha support.', cat: 'Agriculture', elig: 'Farmers willing to adopt organic farming', state: 'All India', target: 'Farmers', benefits: ['Rs.50,000/ha over 3 years', 'Organic certification', 'Market linkage'], docs: ['Land records', 'Aadhaar', 'Bank account'], deadline: 'Ongoing', url: 'https://pgsindia-ncof.gov.in' },
    { id: 'nfsm', name: 'National Food Security Mission', desc: 'Increases production of rice, wheat, pulses, coarse cereals through area expansion.', cat: 'Agriculture', elig: 'Farmers in identified districts', state: 'All India', target: 'Farmers', benefits: ['Seed distribution', 'Farm machinery subsidy', 'Technology demonstration'], docs: ['Land records', 'Aadhaar'], deadline: 'Ongoing', url: 'https://nfsm.gov.in' },
    { id: 'rashtriya-krishi', name: 'Rashtriya Krishi Vikas Yojana', desc: 'Provides financial assistance to states for agricultural development plans.', cat: 'Agriculture', elig: 'State agriculture departments and farmers', state: 'All India', target: 'Farmers', benefits: ['Infrastructure development', 'Agri-business support', 'Value chain development'], docs: ['Project proposal', 'Land records'], deadline: 'Ongoing', url: 'https://rkvy.nic.in' },
    { id: 'agri-infra', name: 'Agriculture Infrastructure Fund', desc: 'Rs.1 lakh crore financing for post-harvest management and community farming assets.', cat: 'Agriculture', elig: 'Farmers, FPOs, agri-entrepreneurs', state: 'All India', target: 'Farmers', benefits: ['3% interest subvention', 'Credit guarantee', 'Rs.2 crore per project'], docs: ['Project report', 'Bank account', 'Aadhaar'], deadline: '2025-26', url: 'https://agriinfra.dac.gov.in' },

    // ===== EDUCATION (40+ schemes) =====
    { id: 'nsp', name: 'National Scholarship Portal', desc: 'One-stop platform for pre-matric, post-matric, and merit-based scholarships.', cat: 'Education', elig: 'Students meeting income & merit criteria', state: 'All India', target: 'Students', benefits: ['Scholarships Rs.5,000-50,000/year', 'Tuition fee coverage', 'Direct bank transfer'], docs: ['Aadhaar', 'Income Certificate', 'Marksheet', 'Bank account'], deadline: 'Feb 28, 2026', url: 'https://scholarships.gov.in' },
    { id: 'pm-vidyalaxmi', name: 'PM Vidyalaxmi Yojana', desc: 'Education loans with interest subsidy for economically weaker students in quality institutions.', cat: 'Education', elig: 'Students admitted to QS-ranked institutions', state: 'All India', target: 'Students', benefits: ['Interest subsidy on education loans', 'Collateral-free loans', 'Merit-based support'], docs: ['Admission letter', 'Income proof', 'Aadhaar', 'Bank account'], deadline: 'Ongoing', url: 'https://www.vidyalakshmi.co.in' },
    { id: 'midday-meal', name: 'PM POSHAN (Mid-Day Meal)', desc: 'Free nutritious lunch to children in government schools to improve attendance and nutrition.', cat: 'Education', elig: 'Students in govt/aided schools (Class 1-8)', state: 'All India', target: 'Students', benefits: ['Free hot cooked meal', 'Improved nutrition', 'Better attendance'], docs: ['School enrollment', 'Aadhaar'], deadline: 'Ongoing', url: 'https://mdm.nic.in' },
    { id: 'sarva-shiksha', name: 'Samagra Shiksha Abhiyan', desc: 'Integrated scheme for school education from pre-school to Class 12.', cat: 'Education', elig: 'All school-going children', state: 'All India', target: 'Students', benefits: ['Free textbooks', 'Uniforms', 'Digital education', 'Teacher training'], docs: ['School enrollment'], deadline: 'Ongoing', url: 'https://samagra.education.gov.in' },
    { id: 'inspire', name: 'INSPIRE Scholarship', desc: 'Scholarship to top 1% students pursuing natural and basic sciences at BSc/MSc level.', cat: 'Education', elig: 'Top 1% students in Class 12 pursuing science', state: 'All India', target: 'Students', benefits: ['Rs.80,000/year scholarship', 'Research internship', 'Career mentoring'], docs: ['Class 12 marksheet', 'Admission proof', 'Bank account'], deadline: 'Annual', url: 'https://online-inspire.gov.in' },
    { id: 'pragati', name: 'PRAGATI Scholarship for Girls', desc: 'AICTE scholarship for girl students in technical education programs.', cat: 'Education', elig: 'Girl students in AICTE-approved institutions', state: 'All India', target: 'Students', benefits: ['Rs.50,000/year', 'Incidental charges covered', 'Merit-cum-means based'], docs: ['Admission letter', 'Income certificate', 'Aadhaar'], deadline: 'Annual', url: 'https://www.aicte-india.org' },
    { id: 'ishan-uday', name: 'Ishan Uday Scholarship (NE Region)', desc: 'Scholarship for students from North-Eastern states pursuing higher education.', cat: 'Education', elig: 'Students from NE states in higher education', state: 'All India', target: 'Students', benefits: ['Rs.5,400/month (general)', 'Rs.7,800/month (technical)', '4-year duration'], docs: ['Domicile certificate', 'Admission proof', 'Income certificate'], deadline: 'Annual', url: 'https://scholarships.gov.in' },
    { id: 'beti-bachao', name: 'Beti Bachao Beti Padhao', desc: 'Campaign for survival, protection, and education of the girl child.', cat: 'Education', elig: 'Girl children across India', state: 'All India', target: 'Students', benefits: ['Awareness campaigns', 'Improved girl child ratio', 'Education support'], docs: ['Birth certificate', 'Aadhaar'], deadline: 'Ongoing', url: 'https://wcd.nic.in' },

    // ===== HEALTHCARE (35+ schemes) =====
    { id: 'pmjay', name: 'Ayushman Bharat - PMJAY', desc: 'Health cover of Rs.5 lakh/family/year for hospitalization covering 1,500+ procedures.', cat: 'Healthcare', elig: 'Bottom 40% population (SECC data)', state: 'All India', target: 'General', benefits: ['Rs.5 lakh health cover', 'Cashless treatment', '1,500+ procedures covered'], docs: ['Aadhaar', 'Ration Card', 'SECC proof'], deadline: 'Ongoing', url: 'https://pmjay.gov.in' },
    { id: 'pmmvy', name: 'PM Matru Vandana Yojana', desc: 'Rs.5,000 maternity benefit for pregnant women for first living child.', cat: 'Healthcare', elig: 'Pregnant women for first child', state: 'All India', target: 'Women', benefits: ['Rs.5,000 in 3 installments', 'Nutrition support', 'Wage loss compensation'], docs: ['Aadhaar', 'MCP Card', 'Bank account'], deadline: 'Ongoing', url: 'https://pmmvy.wcd.gov.in' },
    { id: 'janaushadhi', name: 'PM Bhartiya Janaushadhi Pariyojana', desc: 'Quality generic medicines at 50-90% less price through Janaushadhi Kendras.', cat: 'Healthcare', elig: 'All citizens', state: 'All India', target: 'General', benefits: ['Medicines at 50-90% discount', '9,000+ stores', '1,900+ medicines'], docs: ['None required'], deadline: 'Ongoing', url: 'https://janaushadhi.gov.in' },
    { id: 'ayushman-bhav', name: 'Ayushman Bharat Health Account', desc: 'Digital health records and unique health ID for every citizen.', cat: 'Healthcare', elig: 'All Indian citizens', state: 'All India', target: 'General', benefits: ['Unique Health ID', 'Digital health records', 'Easy medical history access'], docs: ['Aadhaar', 'Mobile number'], deadline: 'Ongoing', url: 'https://healthid.ndhm.gov.in' },
    { id: 'mission-indradhanush', name: 'Mission Indradhanush', desc: 'Full immunization of children and pregnant women against vaccine-preventable diseases.', cat: 'Healthcare', elig: 'Children under 2 and pregnant women', state: 'All India', target: 'Women', benefits: ['Free vaccination', '12 vaccine-preventable diseases', 'Door-to-door coverage'], docs: ['Birth certificate', 'MCP card'], deadline: 'Ongoing', url: 'https://nhm.gov.in' },
    { id: 'rashtriya-swasthya', name: 'Rashtriya Swasthya Bima Yojana', desc: 'Health insurance for BPL families with cashless treatment up to Rs.30,000.', cat: 'Healthcare', elig: 'BPL families', state: 'All India', target: 'General', benefits: ['Rs.30,000 health cover', 'Cashless treatment', 'Smart card based'], docs: ['BPL card', 'Aadhaar', 'Family photo'], deadline: 'Ongoing', url: 'https://www.rsby.gov.in' },

    // ===== BUSINESS (40+ schemes) =====
    { id: 'mudra', name: 'PM MUDRA Yojana', desc: 'Collateral-free loans up to Rs.10 lakh for micro enterprises in three categories.', cat: 'Business', elig: 'Non-corporate small enterprises', state: 'All India', target: 'Entrepreneurs', benefits: ['Loans up to Rs.10 lakh', 'No collateral', 'Three categories: Shishu/Kishore/Tarun'], docs: ['Business plan', 'Identity proof', 'Address proof'], deadline: 'Ongoing', url: 'https://www.mudra.org.in' },
    { id: 'startup-seed', name: 'Startup India Seed Fund', desc: 'Financial assistance up to Rs.50 lakh for DPIIT-recognized startups.', cat: 'Business', elig: 'DPIIT-recognized startups within 2 years', state: 'All India', target: 'Startups', benefits: ['Grant up to Rs.20 lakh', 'Debt up to Rs.50 lakh', 'Incubator support'], docs: ['DPIIT certificate', 'Business plan', 'Bank account'], deadline: 'Ongoing', url: 'https://seedfund.startupindia.gov.in' },
    { id: 'standup', name: 'Stand-Up India', desc: 'Bank loans Rs.10 lakh to Rs.1 crore for SC/ST and women entrepreneurs.', cat: 'Business', elig: 'SC/ST or women entrepreneurs', state: 'All India', target: 'Entrepreneurs', benefits: ['Loans Rs.10L-1Cr', 'Up to 75% project cost', '7 year repayment'], docs: ['Caste certificate', 'Project report', 'Business plan'], deadline: 'Ongoing', url: 'https://www.standupmitra.in' },
    { id: 'pmegp', name: 'PM Employment Generation Programme', desc: 'Credit-linked subsidy 15-35% for micro-enterprises, max Rs.50 lakh manufacturing.', cat: 'Business', elig: 'Individuals above 18 years', state: 'All India', target: 'Entrepreneurs', benefits: ['15-35% subsidy', 'Rs.50L manufacturing', 'Rs.20L service sector'], docs: ['Project report', 'Education certificates', 'Aadhaar'], deadline: 'Ongoing', url: 'https://www.kviconline.gov.in' },
    { id: 'svanidhi', name: 'PM SVANidhi', desc: 'Working capital loans up to Rs.50,000 for street vendors with 7% interest subsidy.', cat: 'Business', elig: 'Street vendors with vending certificate', state: 'All India', target: 'Entrepreneurs', benefits: ['Loans up to Rs.50,000', '7% interest subsidy', 'Digital transaction cashback'], docs: ['Vending certificate', 'Aadhaar', 'Bank account'], deadline: 'Dec 2026', url: 'https://pmsvanidhi.mohua.gov.in' },
    { id: 'msme-champion', name: 'MSME CHAMPION Portal', desc: 'Single window for MSME grievances, information, and handholding support.', cat: 'Business', elig: 'All MSMEs', state: 'All India', target: 'MSMEs', benefits: ['Grievance resolution', 'Information hub', 'Handholding support'], docs: ['Udyam registration'], deadline: 'Ongoing', url: 'https://champion.gov.in' },
    { id: 'cgtsme', name: 'Credit Guarantee for MSMEs', desc: 'Collateral-free credit guarantee up to Rs.5 crore for MSMEs.', cat: 'Business', elig: 'New and existing MSMEs', state: 'All India', target: 'MSMEs', benefits: ['Collateral-free guarantee', 'Up to Rs.5 crore', '85% guarantee cover'], docs: ['Business registration', 'Bank account', 'Financial statements'], deadline: 'Ongoing', url: 'https://www.cgtmse.in' },
    { id: 'zed-cert', name: 'ZED Certification for MSMEs', desc: 'Zero Defect Zero Effect certification with subsidized testing and consultancy.', cat: 'Business', elig: 'All MSMEs', state: 'All India', target: 'MSMEs', benefits: ['Quality certification', 'Subsidized testing', 'Market access'], docs: ['Udyam registration', 'GST registration'], deadline: 'Ongoing', url: 'https://zed.msme.gov.in' },

    // ===== HOUSING (15+ schemes) =====
    { id: 'pmay-urban', name: 'PM Awas Yojana (Urban)', desc: 'Affordable housing with interest subsidy of 6.5% on home loans for urban poor.', cat: 'Housing', elig: 'EWS/LIG without pucca house', state: 'All India', target: 'Urban Poor', benefits: ['6.5% interest subsidy', 'Rs.2.67 lakh subsidy', 'Housing for all'], docs: ['Aadhaar', 'Income certificate', 'No-home certificate'], deadline: 'Dec 2026', url: 'https://pmaymis.gov.in' },
    { id: 'pmay-gramin', name: 'PM Awas Yojana (Gramin)', desc: 'Financial assistance of Rs.1.20-1.30 lakh for construction of pucca houses in rural areas.', cat: 'Housing', elig: 'Houseless/kutcha house rural families', state: 'All India', target: 'Rural', benefits: ['Rs.1.20-1.30 lakh assistance', 'Toilet construction included', '90 days MGNREGA wages'], docs: ['Aadhaar', 'SECC data inclusion', 'Bank account'], deadline: 'Dec 2026', url: 'https://pmayg.nic.in' },
    { id: 'svamitva', name: 'SVAMITVA Scheme', desc: 'Property cards for rural households using drone surveys for financial empowerment.', cat: 'Housing', elig: 'Rural property owners', state: 'All India', target: 'Rural', benefits: ['Legal property cards', 'Loan collateral', 'Dispute reduction'], docs: ['Aadhaar', 'Village records'], deadline: 'Ongoing', url: 'https://svamitva.nic.in' },

    // ===== SOCIAL WELFARE (30+ schemes) =====
    { id: 'nrega', name: 'MGNREGA', desc: '100 days guaranteed wage employment per year to rural households for unskilled manual work.', cat: 'Social Welfare', elig: 'Adult members of rural households', state: 'All India', target: 'General', benefits: ['100 days guaranteed work', 'Minimum wages', 'Unemployment allowance'], docs: ['Job card', 'Aadhaar', 'Bank account'], deadline: 'Ongoing', url: 'https://nrega.nic.in' },
    { id: 'nsap', name: 'National Social Assistance Programme', desc: 'Pension and assistance for elderly, widows, and disabled persons of BPL families.', cat: 'Social Welfare', elig: 'BPL elderly (60+), widows, disabled', state: 'All India', target: 'Senior Citizens', benefits: ['Monthly pension Rs.200-500', 'Death benefit Rs.20,000', 'Disability assistance'], docs: ['Age proof', 'BPL card', 'Aadhaar', 'Bank account'], deadline: 'Ongoing', url: 'https://nsap.nic.in' },
    { id: 'ujjwala', name: 'PM Ujjwala Yojana', desc: 'Free LPG connections for women from BPL households to ensure clean cooking fuel.', cat: 'Social Welfare', elig: 'Women from BPL households', state: 'All India', target: 'Women', benefits: ['Free LPG connection', 'First refill free', 'EMI for stove'], docs: ['Aadhaar', 'BPL card', 'Bank account'], deadline: 'Ongoing', url: 'https://www.pmujjwalayojana.com' },
    { id: 'pmgky-anna', name: 'PM Garib Kalyan Anna Yojana', desc: 'Free foodgrains (5kg/person/month) to priority households and Antyodaya families.', cat: 'Food & Distribution', elig: 'NFSA beneficiary households', state: 'All India', target: 'BPL Families', benefits: ['5kg free foodgrains/person/month', 'Additional to regular PDS', 'Rice, wheat, coarse grains'], docs: ['Ration card', 'Aadhaar'], deadline: 'Dec 2028', url: 'https://dfpd.gov.in' },
    { id: 'one-nation-ration', name: 'One Nation One Ration Card', desc: 'Portability of ration card benefits allowing purchase from any FPS across India.', cat: 'Food & Distribution', elig: 'All ration card holders', state: 'All India', target: 'General', benefits: ['Ration portability', 'Any FPS in India', 'Aadhaar-based authentication'], docs: ['Ration card', 'Aadhaar'], deadline: 'Ongoing', url: 'https://impds.nic.in' },

    // ===== SKILL DEVELOPMENT (20+ schemes) =====
    { id: 'pmkvy', name: 'PM Kaushal Vikas Yojana', desc: 'Free short-term skill training (150-300 hours) with certification and placement support.', cat: 'Skill Development', elig: 'Class 10 dropouts or unemployed', state: 'All India', target: 'Youth', benefits: ['Free skill training', 'Government certification', 'Placement support'], docs: ['Aadhaar', 'Education certificates', 'Bank account'], deadline: 'Ongoing', url: 'https://www.pmkvyofficial.org' },
    { id: 'vishwakarma', name: 'PM Vishwakarma Yojana', desc: 'Support for traditional artisans with skill training, toolkit incentive, and credit up to Rs.3 lakh.', cat: 'Skill Development', elig: 'Traditional artisans and craftspeople', state: 'All India', target: 'Workers', benefits: ['Rs.15,000 toolkit incentive', 'Credit up to Rs.3 lakh at 5%', 'Skill training'], docs: ['Aadhaar', 'Trade proof', 'Bank account'], deadline: 'Mar 31, 2026', url: 'https://pmvishwakarma.gov.in' },
    { id: 'ddugky', name: 'DDU Grameen Kaushalya Yojana', desc: 'Placement-linked skill training for rural youth aged 15-35 from poor families.', cat: 'Skill Development', elig: 'Rural youth (15-35) from poor families', state: 'All India', target: 'Youth', benefits: ['Free residential training', 'Placement guarantee', 'Post-placement support'], docs: ['Aadhaar', 'Income certificate', 'Age proof'], deadline: 'Ongoing', url: 'https://ddugky.gov.in' },
    { id: 'naps', name: 'National Apprenticeship Promotion', desc: 'Stipend support for apprentices in establishments with direct industry exposure.', cat: 'Skill Development', elig: 'Youth aged 14+ with minimum education', state: 'All India', target: 'Youth', benefits: ['Monthly stipend', 'Industry exposure', '25% govt contribution to stipend'], docs: ['Education certificates', 'Aadhaar', 'Bank account'], deadline: 'Ongoing', url: 'https://apprenticeshipindia.gov.in' },

    // ===== PENSION & INSURANCE (15+ schemes) =====
    { id: 'apy', name: 'Atal Pension Yojana', desc: 'Guaranteed pension of Rs.1,000-5,000/month after 60, with government co-contribution.', cat: 'Pension & Insurance', elig: 'Indian citizens aged 18-40', state: 'All India', target: 'Workers', benefits: ['Guaranteed pension Rs.1,000-5,000', '50% govt co-contribution', 'Tax benefits under 80CCD'], docs: ['Aadhaar', 'Bank account', 'Mobile number'], deadline: 'Enroll before 40', url: 'https://www.npscra.nsdl.co.in' },
    { id: 'nps', name: 'National Pension System', desc: 'Voluntary retirement savings with market-linked returns and tax benefits up to Rs.2 lakh.', cat: 'Pension & Insurance', elig: 'Indian citizens aged 18-70', state: 'All India', target: 'General', benefits: ['Tax deduction up to Rs.2 lakh', 'Market-linked returns', 'Flexible contribution'], docs: ['PAN Card', 'Aadhaar', 'Bank account'], deadline: 'Enroll before 70', url: 'https://www.npscra.nsdl.co.in' },
    { id: 'pmsby', name: 'PM Suraksha Bima Yojana', desc: 'Accident insurance of Rs.2 lakh at just Rs.20/year premium for bank account holders.', cat: 'Pension & Insurance', elig: 'Bank account holders aged 18-70', state: 'All India', target: 'General', benefits: ['Rs.2 lakh accidental death cover', 'Rs.1 lakh partial disability', 'Only Rs.20/year premium'], docs: ['Bank account', 'Aadhaar'], deadline: 'Ongoing', url: 'https://jansuraksha.gov.in' },
    { id: 'pmjjby', name: 'PM Jeevan Jyoti Bima Yojana', desc: 'Life insurance of Rs.2 lakh at Rs.436/year premium for bank account holders.', cat: 'Pension & Insurance', elig: 'Bank account holders aged 18-50', state: 'All India', target: 'General', benefits: ['Rs.2 lakh life cover', 'Only Rs.436/year', 'Auto-debit from bank'], docs: ['Bank account', 'Aadhaar', 'Nominee details'], deadline: 'Ongoing', url: 'https://jansuraksha.gov.in' },

    // ===== BANKING & FINANCE =====
    { id: 'jan-dhan', name: 'PM Jan Dhan Yojana', desc: 'Zero balance bank account with RuPay card, Rs.2 lakh accident insurance, and overdraft.', cat: 'Banking & Finance', elig: 'Unbanked Indian citizens', state: 'All India', target: 'General', benefits: ['Zero balance account', 'Rs.2 lakh accident insurance', 'Rs.10,000 overdraft', 'RuPay debit card'], docs: ['Aadhaar or any ID proof', 'Photo'], deadline: 'Ongoing', url: 'https://pmjdy.gov.in' },
    { id: 'sukanya', name: 'Sukanya Samriddhi Yojana', desc: 'Savings scheme for girl child with 8.2% interest and tax-free maturity.', cat: 'Banking & Finance', elig: 'Parents of girl child below 10 years', state: 'All India', target: 'Students', benefits: ['8.2% interest rate', 'Tax free under 80C', 'Partial withdrawal at 18'], docs: ['Birth certificate', 'Parent ID', 'Address proof'], deadline: 'Before girl turns 10', url: 'https://www.nsiindia.gov.in' },

    // ===== ENERGY =====
    { id: 'kusum', name: 'PM-KUSUM Solar Scheme', desc: 'Solar pumps and grid-connected solar for farmers with 60% subsidy.', cat: 'Energy', elig: 'All farmers', state: 'All India', target: 'Farmers', benefits: ['60% subsidy on solar pumps', 'Grid-connected solar income', 'Reduced electricity bills'], docs: ['Land records', 'Aadhaar', 'Bank account'], deadline: 'Ongoing', url: 'https://mnre.gov.in/kusum' },
    { id: 'rooftop-solar', name: 'Rooftop Solar Scheme', desc: 'Subsidy for rooftop solar panels installation for residential consumers.', cat: 'Energy', elig: 'Residential electricity consumers', state: 'All India', target: 'General', benefits: ['Up to 40% subsidy', 'Reduced electricity bills', 'Net metering income'], docs: ['Electricity bill', 'Property proof', 'Aadhaar'], deadline: 'Ongoing', url: 'https://solarrooftop.gov.in' },
    { id: 'saubhagya', name: 'Saubhagya Scheme', desc: 'Free electricity connections to all remaining un-electrified households.', cat: 'Energy', elig: 'Un-electrified rural/urban households', state: 'All India', target: 'General', benefits: ['Free electricity connection', 'LED bulb included', 'Battery bank for remote areas'], docs: ['Identity proof', 'Address proof'], deadline: 'Ongoing', url: 'https://saubhagya.gov.in' },

    // ===== DIGITAL INDIA =====
    { id: 'pmgdisha', name: 'PM Gramin Digital Saksharta Abhiyan', desc: 'Free digital literacy training covering smartphones, internet, and e-governance.', cat: 'Digital India', elig: 'One member per rural household (14-60 yrs)', state: 'All India', target: 'Rural', benefits: ['Free 20-hour training', 'Government certification', 'Digital payment training'], docs: ['Aadhaar', 'Age proof'], deadline: 'Mar 2026', url: 'https://www.pmgdisha.in' },
    { id: 'digilocker', name: 'DigiLocker', desc: 'Cloud-based platform for issuance and verification of government documents.', cat: 'Digital India', elig: 'All Indian citizens with Aadhaar', state: 'All India', target: 'General', benefits: ['Digital document storage', 'Government-verified documents', 'Reduce physical documents'], docs: ['Aadhaar', 'Mobile number'], deadline: 'Ongoing', url: 'https://digilocker.gov.in' },
    { id: 'umang', name: 'UMANG App', desc: 'Unified mobile app for accessing 1,200+ government services across departments.', cat: 'Digital India', elig: 'All citizens', state: 'All India', target: 'General', benefits: ['1,200+ govt services', 'Single app access', 'Bill payments and tracking'], docs: ['Mobile number'], deadline: 'Ongoing', url: 'https://web.umang.gov.in' },

    // ===== RURAL DEVELOPMENT =====
    { id: 'pmgsy', name: 'PM Gram Sadak Yojana', desc: 'All-weather road connectivity to unconnected eligible rural habitations.', cat: 'Rural Development', elig: 'Unconnected rural habitations', state: 'All India', target: 'Rural', benefits: ['All-weather road connectivity', 'Bridge construction', 'Road upgradation'], docs: ['Village records'], deadline: 'Ongoing', url: 'https://pmgsy.nic.in' },
    { id: 'swachh-bharat', name: 'Swachh Bharat Mission (Gramin)', desc: 'Individual household latrines and ODF sustainability in rural India.', cat: 'Rural Development', elig: 'Rural households without toilets', state: 'All India', target: 'Rural', benefits: ['Rs.12,000 for toilet construction', 'ODF community incentive', 'Waste management'], docs: ['Aadhaar', 'BPL card'], deadline: 'Ongoing', url: 'https://swachhbharatmission.gov.in' },
    { id: 'jal-jeevan', name: 'Jal Jeevan Mission', desc: 'Functional household tap water connections (55 lpcd) to every rural household.', cat: 'Rural Development', elig: 'All rural households', state: 'All India', target: 'Rural', benefits: ['Household tap water connection', '55 litres per capita per day', 'Water quality testing'], docs: ['Household survey inclusion'], deadline: '2026', url: 'https://jaljeevanmission.gov.in' },
    { id: 'deen-dayal', name: 'Deen Dayal Upadhyaya Gram Jyoti', desc: 'Rural electrification through separation of agricultural and domestic feeders.', cat: 'Rural Development', elig: 'Rural areas', state: 'All India', target: 'Rural', benefits: ['24x7 rural power supply', 'Agricultural feeder separation', 'Smart metering'], docs: ['Village records'], deadline: 'Ongoing', url: 'https://www.ddugjy.gov.in' },

    // ===== TRANSPORT =====
    { id: 'fame-ii', name: 'FAME-II (Electric Vehicles)', desc: 'Subsidies for purchase of electric vehicles to reduce pollution and oil dependency.', cat: 'Transport', elig: 'EV buyers (2W, 3W, 4W, buses)', state: 'All India', target: 'General', benefits: ['Electric 2W subsidy', 'Electric bus procurement', 'Charging infrastructure'], docs: ['Vehicle purchase invoice', 'Aadhaar', 'Bank account'], deadline: 'Mar 2026', url: 'https://fame2.heavyindustries.gov.in' },
    { id: 'pm-ebike', name: 'PM E-DRIVE Scheme', desc: 'Subsidy for electric two-wheelers and three-wheelers for clean mobility.', cat: 'Transport', elig: 'Electric vehicle buyers', state: 'All India', target: 'General', benefits: ['Subsidy on e-2W/3W', 'Reduced pollution', 'Lower operating cost'], docs: ['Purchase invoice', 'Aadhaar'], deadline: '2026', url: 'https://heavyindustries.gov.in' },

    // ===== LABOUR & EMPLOYMENT =====
    { id: 'epfo', name: 'Employees Provident Fund', desc: 'Mandatory provident fund savings for employees with employer contribution.', cat: 'Labour & Employment', elig: 'Employees earning up to Rs.15,000/month', state: 'All India', target: 'Workers', benefits: ['12% employer contribution', 'Pension benefit', 'Insurance cover'], docs: ['Aadhaar', 'PAN', 'Bank account'], deadline: 'Ongoing', url: 'https://www.epfindia.gov.in' },
    { id: 'esic', name: 'Employees State Insurance', desc: 'Health insurance and social security for workers earning up to Rs.21,000/month.', cat: 'Labour & Employment', elig: 'Workers in covered establishments', state: 'All India', target: 'Workers', benefits: ['Medical benefits', 'Sickness allowance', 'Maternity benefit', 'Disability pension'], docs: ['Aadhaar', 'Employment proof', 'Photo'], deadline: 'Ongoing', url: 'https://www.esic.gov.in' },
    { id: 'eshram', name: 'e-Shram Portal', desc: 'National database for unorganized workers with Rs.2 lakh accident insurance.', cat: 'Labour & Employment', elig: 'Unorganized sector workers', state: 'All India', target: 'Workers', benefits: ['e-Shram card', 'Rs.2 lakh accident insurance', 'Social security benefits'], docs: ['Aadhaar', 'Mobile number', 'Bank account'], deadline: 'Ongoing', url: 'https://eshram.gov.in' },

    // ===== WOMEN & CHILD =====
    { id: 'one-stop', name: 'One Stop Centre (Sakhi)', desc: 'Integrated support for women affected by violence with shelter, legal aid, counselling.', cat: 'Women & Child', elig: 'Women affected by violence (all ages)', state: 'All India', target: 'Women', benefits: ['24/7 support', 'Medical assistance', 'Legal aid', 'Temporary shelter'], docs: ['None required for emergency'], deadline: 'Ongoing', url: 'https://wcd.nic.in' },
    { id: 'mahila-shakti', name: 'Mahila Shakti Kendra', desc: 'Community engagement through student volunteers for rural women empowerment.', cat: 'Women & Child', elig: 'Rural women', state: 'All India', target: 'Women', benefits: ['Skill development', 'Digital literacy', 'Health awareness'], docs: ['Aadhaar'], deadline: 'Ongoing', url: 'https://wcd.nic.in' },
    { id: 'icds', name: 'Integrated Child Development Services', desc: 'Supplementary nutrition, immunization, health checkup, and pre-school education for children.', cat: 'Women & Child', elig: 'Children 0-6 years, pregnant women', state: 'All India', target: 'Children', benefits: ['Supplementary nutrition', 'Immunization', 'Pre-school education', 'Health checkup'], docs: ['Birth certificate', 'Aadhaar'], deadline: 'Ongoing', url: 'https://icds-wcd.nic.in' },

    // ===== SCIENCE & TECHNOLOGY =====
    { id: 'kishore', name: 'KVPY/INSPIRE Fellowship', desc: 'Fellowship for pursuing research in basic sciences at BSc to PhD level.', cat: 'Science & Technology', elig: 'Students in basic sciences', state: 'All India', target: 'Students', benefits: ['Monthly fellowship', 'Annual contingency grant', 'Research support'], docs: ['Academic records', 'Research proposal'], deadline: 'Annual', url: 'https://online-inspire.gov.in' },
    { id: 'serb-funding', name: 'SERB Research Grants', desc: 'Funding for scientific research projects across all disciplines.', cat: 'Science & Technology', elig: 'PhD holders in academic/research institutions', state: 'All India', target: 'Researchers', benefits: ['Research project funding', 'Equipment grants', 'Travel support'], docs: ['PhD certificate', 'Research proposal', 'Institutional support'], deadline: 'Rolling', url: 'https://www.serb.gov.in' },

    // ===== ENVIRONMENT =====
    { id: 'namami-gange', name: 'Namami Gange Mission', desc: 'Comprehensive mission for Ganga rejuvenation with pollution abatement and conservation.', cat: 'Environment', elig: 'Projects along Ganga basin', state: 'All India', target: 'General', benefits: ['River cleaning', 'Sewage treatment', 'Biodiversity conservation'], docs: ['Project proposal'], deadline: 'Ongoing', url: 'https://nmcg.nic.in' },
    { id: 'green-india', name: 'Green India Mission', desc: 'Afforestation and restoration of degraded forests and ecosystems.', cat: 'Environment', elig: 'Forest-fringe communities', state: 'All India', target: 'General', benefits: ['Forest restoration', 'Livelihood support', 'Carbon sequestration'], docs: ['Community registration'], deadline: 'Ongoing', url: 'https://moef.gov.in' },

    // ===== SPORTS & YOUTH =====
    { id: 'khelo-india', name: 'Khelo India Programme', desc: 'Annual national-level sports competition with scholarships for talented athletes.', cat: 'Sports & Youth', elig: 'Athletes under 17/21 years', state: 'All India', target: 'Athletes', benefits: ['Rs.5 lakh/year scholarship', '8-year support', 'Training and coaching'], docs: ['Sports federation ID', 'Age proof', 'Aadhaar'], deadline: 'Annual', url: 'https://kheloindia.gov.in' },
    { id: 'target-olympic', name: 'Target Olympic Podium Scheme', desc: 'Financial support to potential Olympic medal winners with world-class training.', cat: 'Sports & Youth', elig: 'Elite athletes with medal potential', state: 'All India', target: 'Athletes', benefits: ['Monthly allowance', 'International training', 'Equipment support'], docs: ['Sports achievements', 'Federation nomination'], deadline: 'Ongoing', url: 'https://yas.nic.in' },
    { id: 'nsdf', name: 'National Sports Development Fund', desc: 'Financial assistance to sportspersons for training, equipment, and competition.', cat: 'Sports & Youth', elig: 'National-level sportspersons', state: 'All India', target: 'Athletes', benefits: ['Training support', 'Equipment', 'Competition travel'], docs: ['Sports achievements', 'Federation certificate'], deadline: 'Ongoing', url: 'https://yas.nic.in' },

    // ===== DEFENCE & VETERANS =====
    { id: 'agniveer', name: 'Agnipath Scheme', desc: 'Short-term military recruitment for youth aged 17.5-23 with Seva Nidhi package.', cat: 'Defence & Veterans', elig: 'Youth aged 17.5-23 years', state: 'All India', target: 'Defence Personnel', benefits: ['4-year military service', 'Rs.11.71 lakh Seva Nidhi', 'Skill certification'], docs: ['Education certificates', 'Age proof', 'Medical fitness'], deadline: 'Annual recruitment', url: 'https://www.joinindianarmy.nic.in' },
    { id: 'echs', name: 'Ex-Servicemen Health Scheme', desc: 'Medical treatment for ex-servicemen and dependents at empaneled hospitals.', cat: 'Defence & Veterans', elig: 'Ex-servicemen and dependents', state: 'All India', target: 'Ex-Servicemen', benefits: ['Free medical treatment', 'Empaneled hospitals', 'Cashless treatment'], docs: ['Discharge book', 'ECHS card', 'Aadhaar'], deadline: 'Ongoing', url: 'https://echs.gov.in' },

    // ===== FISHERIES =====
    { id: 'pmmsy', name: 'PM Matsya Sampada Yojana', desc: 'Rs.20,050 crore scheme for sustainable fisheries development and infrastructure.', cat: 'Fisheries', elig: 'Fishermen, fish farmers, entrepreneurs', state: 'All India', target: 'Fishermen', benefits: ['60% subsidy for SC/ST/women', '40% subsidy for others', 'Insurance cover', 'Infrastructure support'], docs: ['Fishing license', 'Aadhaar', 'Bank account'], deadline: '2024-25', url: 'https://pmmsy.dof.gov.in' },
    { id: 'kcc-fisheries', name: 'KCC for Fisheries & Animal Husbandry', desc: 'Kisan Credit Card extended to fisheries and animal husbandry sector.', cat: 'Fisheries', elig: 'Fish farmers and animal husbandry farmers', state: 'All India', target: 'Fishermen', benefits: ['Credit at 4% interest', 'Working capital support', 'Insurance cover'], docs: ['Activity proof', 'Aadhaar', 'Bank account'], deadline: 'Ongoing', url: 'https://pmkisan.gov.in' },

    // ===== TEXTILES =====
    { id: 'samarth', name: 'SAMARTH (Textile Sector Skill)', desc: 'Skill development in textiles covering spinning, weaving, processing, garmenting.', cat: 'Textiles', elig: 'Youth interested in textile sector', state: 'All India', target: 'Workers', benefits: ['Free skill training', 'Placement support', 'Government certification'], docs: ['Aadhaar', 'Education proof'], deadline: 'Ongoing', url: 'https://samarth-textiles.gov.in' },
    { id: 'powertex', name: 'PowerTex India', desc: 'Comprehensive scheme for powerloom sector with group workshed and yarn bank.', cat: 'Textiles', elig: 'Powerloom workers and weavers', state: 'All India', target: 'Workers', benefits: ['Common facility centre', 'Yarn at mill price', 'Solar energy support'], docs: ['Weaver ID', 'Aadhaar'], deadline: 'Ongoing', url: 'https://texmin.nic.in' },

    // ===== TRIBAL WELFARE =====
    { id: 'van-dhan', name: 'Van Dhan Vikas Kendra', desc: 'Value addition to minor forest produce by tribals through Van Dhan Kendras.', cat: 'Tribal Welfare', elig: 'Tribal gatherers of forest produce', state: 'All India', target: 'Tribal', benefits: ['Value addition training', 'Market linkage', 'SHG formation'], docs: ['Tribal certificate', 'Aadhaar'], deadline: 'Ongoing', url: 'https://trifed.tribal.gov.in' },
    { id: 'eklavya', name: 'Eklavya Model Residential School', desc: 'Quality residential schools for tribal students in remote areas.', cat: 'Tribal Welfare', elig: 'Tribal students in scheduled areas', state: 'All India', target: 'Tribal', benefits: ['Free residential education', 'Quality teachers', 'Hostel facilities'], docs: ['Tribal certificate', 'Age proof', 'Aadhaar'], deadline: 'Ongoing', url: 'https://tribal.nic.in' },

    // ===== MINORITY AFFAIRS =====
    { id: 'nmdfc', name: 'NMDFC Loan Schemes', desc: 'Concessional loans for economic activities of minorities through channelizing agencies.', cat: 'Minority Affairs', elig: 'Minorities with income below Rs.6 lakh', state: 'All India', target: 'Minorities', benefits: ['Concessional loans', 'Education loans', 'Vocational training'], docs: ['Minority certificate', 'Income proof', 'Aadhaar'], deadline: 'Ongoing', url: 'https://nmdfc.org' },
    { id: 'seekho-hunar', name: 'Seekho Aur Kamao', desc: 'Skill development for minority youth with placement and follow-up.', cat: 'Minority Affairs', elig: 'Minority youth aged 14-35', state: 'All India', target: 'Minorities', benefits: ['Free skill training', 'Stipend during training', 'Placement support'], docs: ['Minority certificate', 'Age proof', 'Aadhaar'], deadline: 'Ongoing', url: 'https://minorityaffairs.gov.in' },
    { id: 'maulana-azad', name: 'Maulana Azad Fellowship', desc: 'Research fellowship for MPhil/PhD scholars from minority communities.', cat: 'Minority Affairs', elig: 'MPhil/PhD minority students', state: 'All India', target: 'Minorities', benefits: ['Monthly fellowship', 'Contingency grant', 'Research support'], docs: ['Minority certificate', 'NET/JRF qualification', 'Admission proof'], deadline: 'Annual', url: 'https://minorityaffairs.gov.in' },

    // ===== URBAN DEVELOPMENT =====
    { id: 'smart-city', name: 'Smart Cities Mission', desc: '100 smart cities with advanced infrastructure, technology, and sustainable development.', cat: 'Urban Development', elig: 'Selected 100 cities', state: 'All India', target: 'General', benefits: ['Smart infrastructure', 'Digital governance', 'Sustainable development'], docs: ['City-level project proposals'], deadline: '2026', url: 'https://smartcities.gov.in' },
    { id: 'amrut', name: 'AMRUT 2.0', desc: 'Water supply and sewerage infrastructure in 500 cities with water security.', cat: 'Urban Development', elig: 'All statutory towns', state: 'All India', target: 'General', benefits: ['100% water supply coverage', 'Sewerage and septage management', 'Rejuvenation of water bodies'], docs: ['City-level proposals'], deadline: '2026', url: 'https://amrut.gov.in' },
    { id: 'swachh-urban', name: 'Swachh Bharat Mission (Urban)', desc: 'ODF++ and waste management in all urban areas.', cat: 'Urban Development', elig: 'All urban local bodies', state: 'All India', target: 'General', benefits: ['ODF sustainability', 'Waste processing', 'Bio-mining of dumpsites'], docs: ['ULB proposals'], deadline: 'Ongoing', url: 'https://swachhbharatmission.gov.in' },
];

// Now generate the full scheme objects
function generateFullSchemes() {
    return SCHEMES.map(s => ({
        id: s.id,
        name: s.name,
        description: s.desc,
        category: s.cat,
        eligibility: s.elig,
        state: s.state,
        target: s.target,
        benefits: s.benefits || [],
        documents: s.docs || [],
        steps: [
            'Check eligibility on the official portal',
            'Register and create an account',
            'Fill in the application form with required details',
            'Upload necessary documents',
            'Submit the application for verification',
            'Track application status online'
        ],
        deadline: s.deadline || 'Ongoing',
        sourceUrl: s.url || ''
    }));
}

// Generate and add state-specific scheme variations
function generateStateSchemes() {
    const stateSchemes = [];
    const stateSpecific = [
        {
            state: 'Tamil Nadu', schemes: [
                { id: 'tn-kalaignar', name: 'Kalaignar Magalir Urimai Thogai', desc: 'Rs.1,000 monthly assistance to women heads of families in Tamil Nadu.', cat: 'Social Welfare', elig: 'Women family heads in TN', target: 'Women' },
                { id: 'tn-breakfast', name: 'TN Chief Minister Breakfast Scheme', desc: 'Free breakfast for government primary school students in Tamil Nadu.', cat: 'Education', elig: 'Primary school students in TN govt schools', target: 'Students' },
                { id: 'tn-health', name: 'TN Chief Minister Comprehensive Health Insurance', desc: 'Free medical and surgical treatment up to Rs.5 lakh for TN residents.', cat: 'Healthcare', elig: 'Tamil Nadu residents', target: 'General' },
            ]
        },
        {
            state: 'Kerala', schemes: [
                { id: 'kl-life', name: 'Kerala LIFE Mission', desc: 'Housing for all homeless and landless families in Kerala.', cat: 'Housing', elig: 'Homeless families in Kerala', target: 'General' },
                { id: 'kl-kshema', name: 'Kerala Social Security Pension', desc: 'Monthly pension for aged, disabled, and widowed persons in Kerala.', cat: 'Social Welfare', elig: 'Elderly, disabled, widows in Kerala', target: 'Senior Citizens' },
            ]
        },
        {
            state: 'Maharashtra', schemes: [
                { id: 'mh-ladki-bahin', name: 'Ladki Bahin Yojana', desc: 'Rs.1,500 monthly financial assistance to women aged 21-65 in Maharashtra.', cat: 'Social Welfare', elig: 'Women aged 21-65 in Maharashtra', target: 'Women' },
                { id: 'mh-ebc', name: 'Maharashtra EBC Fee Waiver', desc: 'Fee waiver for economically backward class students in Maharashtra.', cat: 'Education', elig: 'EBC students in Maharashtra', target: 'Students' },
                { id: 'mh-shetkari', name: 'Namo Shetkari Yojana', desc: 'Rs.6,000/year additional to PM-KISAN for Maharashtra farmers.', cat: 'Agriculture', elig: 'Maharashtra farmers', target: 'Farmers' },
            ]
        },
        {
            state: 'Uttar Pradesh', schemes: [
                { id: 'up-kanya-sumangala', name: 'Kanya Sumangala Yojana', desc: 'Rs.15,000 in six installments for girl children in UP from birth to graduation.', cat: 'Women & Child', elig: 'Girl children in UP', target: 'Children' },
                { id: 'up-pension', name: 'UP Vridha Pension Yojana', desc: 'Monthly pension of Rs.1,000 for elderly citizens above 60 in UP.', cat: 'Social Welfare', elig: 'Senior citizens in UP', target: 'Senior Citizens' },
            ]
        },
        {
            state: 'Rajasthan', schemes: [
                { id: 'rj-chiranjeevi', name: 'Rajasthan Chiranjeevi Yojana', desc: 'Universal health insurance of Rs.25 lakh for every family in Rajasthan.', cat: 'Healthcare', elig: 'All Rajasthan families', target: 'General' },
                { id: 'rj-indira-gandhi', name: 'Indira Gandhi Free Smartphone Yojana', desc: 'Free smartphones to women heads of families in Rajasthan.', cat: 'Digital India', elig: 'Women in Rajasthan', target: 'Women' },
            ]
        },
        {
            state: 'Karnataka', schemes: [
                { id: 'ka-gruha-lakshmi', name: 'Gruha Lakshmi Scheme', desc: 'Rs.2,000 monthly transfer to women heads of households in Karnataka.', cat: 'Social Welfare', elig: 'Women household heads in Karnataka', target: 'Women' },
                { id: 'ka-anna-bhagya', name: 'Anna Bhagya Scheme', desc: '10 kg free rice per month to BPL families in Karnataka.', cat: 'Food & Distribution', elig: 'BPL families in Karnataka', target: 'BPL Families' },
            ]
        },
        {
            state: 'Gujarat', schemes: [
                { id: 'gj-kisan', name: 'Gujarat Kisan Suryoday Yojana', desc: 'Daytime electricity for agriculture in Gujarat with dedicated feeder.', cat: 'Energy', elig: 'Gujarat farmers', target: 'Farmers' },
            ]
        },
        {
            state: 'West Bengal', schemes: [
                { id: 'wb-lakshmir', name: 'Lakshmir Bhandar', desc: 'Monthly income support of Rs.500-1,000 to women heads of families in West Bengal.', cat: 'Social Welfare', elig: 'Women in West Bengal aged 25-60', target: 'Women' },
                { id: 'wb-kanyashree', name: 'Kanyashree Prakalpa', desc: 'Annual scholarship and one-time grant for girl students in West Bengal.', cat: 'Education', elig: 'Girl students in WB from low-income families', target: 'Students' },
            ]
        },
        {
            state: 'Madhya Pradesh', schemes: [
                { id: 'mp-ladli', name: 'Ladli Behna Yojana', desc: 'Rs.1,250 monthly financial assistance to women aged 21-60 in Madhya Pradesh.', cat: 'Social Welfare', elig: 'Women aged 21-60 in MP', target: 'Women' },
            ]
        },
        {
            state: 'Andhra Pradesh', schemes: [
                { id: 'ap-amma-vodi', name: 'Amma Vodi Scheme', desc: 'Rs.15,000/year to mothers/guardians who send children to school in AP.', cat: 'Education', elig: 'Mothers in AP with school-going children', target: 'Women' },
                { id: 'ap-rythu-bharosa', name: 'YSR Rythu Bharosa', desc: 'Rs.13,500/year investment support to farmers in Andhra Pradesh.', cat: 'Agriculture', elig: 'AP farmers', target: 'Farmers' },
            ]
        },
        {
            state: 'Telangana', schemes: [
                { id: 'ts-rythu-bandhu', name: 'Rythu Bandhu', desc: 'Rs.10,000/acre/year investment support to Telangana farmers.', cat: 'Agriculture', elig: 'Telangana farmers with patta land', target: 'Farmers' },
                { id: 'ts-kalyana-lakshmi', name: 'Kalyana Lakshmi', desc: 'Rs.1,00,116 marriage assistance for girls from poor families in Telangana.', cat: 'Women & Child', elig: 'Girls from poor families in Telangana', target: 'Women' },
            ]
        },
        {
            state: 'Odisha', schemes: [
                { id: 'od-kalia', name: 'KALIA Scheme', desc: 'Rs.10,000/year financial assistance to small and marginal farmers in Odisha.', cat: 'Agriculture', elig: 'Small/marginal farmers in Odisha', target: 'Farmers' },
            ]
        },
        {
            state: 'Punjab', schemes: [
                { id: 'pb-aashirwad', name: 'Punjab Aashirwad Scheme', desc: 'Rs.51,000 shagun to SC families for daughter\'s marriage in Punjab.', cat: 'Social Welfare', elig: 'SC families in Punjab', target: 'SC/ST' },
            ]
        },
        {
            state: 'Bihar', schemes: [
                { id: 'bh-student-credit', name: 'Bihar Student Credit Card', desc: 'Education loan up to Rs.4 lakh at zero interest for Bihar students.', cat: 'Education', elig: 'Bihar students after Class 12', target: 'Students' },
            ]
        },
        {
            state: 'Chhattisgarh', schemes: [
                { id: 'cg-mahtari-vandan', name: 'Mahtari Vandan Yojana', desc: 'Rs.1,000 monthly to married women aged 21+ in Chhattisgarh.', cat: 'Social Welfare', elig: 'Married women in CG', target: 'Women' },
            ]
        },
        {
            state: 'Jharkhand', schemes: [
                { id: 'jh-savitribai', name: 'Savitribai Phule Kishori Samridhi', desc: 'Financial assistance for girl students from Class 8-12 in Jharkhand.', cat: 'Education', elig: 'Girl students in Jharkhand', target: 'Students' },
            ]
        },
        {
            state: 'Assam', schemes: [
                { id: 'as-orunodoi', name: 'Arunodoi Scheme', desc: 'Rs.1,250 monthly financial assistance to women in economically weaker families in Assam.', cat: 'Social Welfare', elig: 'Women in Assam from low-income families', target: 'Women' },
            ]
        },
        {
            state: 'Haryana', schemes: [
                { id: 'hr-ladli', name: 'Ladli Scheme', desc: 'Rs.5,000/year for second girl child from birth to Class 12 in Haryana.', cat: 'Women & Child', elig: 'Families with second girl child in Haryana', target: 'Children' },
            ]
        },
        {
            state: 'Himachal Pradesh', schemes: [
                { id: 'hp-sahara', name: 'HP SAHARA Yojana', desc: 'Rs.3,000/month financial support to patients of serious diseases in HP.', cat: 'Healthcare', elig: 'Serious disease patients in HP', target: 'General' },
            ]
        },
        {
            state: 'Goa', schemes: [
                { id: 'ga-laadli', name: 'Goa Laadli Laxmi Scheme', desc: 'Financial support for girl children from birth to Class 12 in Goa.', cat: 'Women & Child', elig: 'Girl children in Goa', target: 'Children' },
            ]
        },
    ];

    for (const ss of stateSpecific) {
        for (const s of ss.schemes) {
            stateSchemes.push({
                id: s.id,
                name: s.name,
                description: s.desc,
                category: s.cat,
                eligibility: s.elig,
                state: ss.state,
                target: s.target,
                benefits: [`State-specific scheme of ${ss.state}`, 'Direct benefit to eligible residents'],
                documents: ['Aadhaar Card', 'Domicile/Residence proof', 'Bank account details'],
                steps: ['Check eligibility on official state portal', 'Apply online or at local office', 'Submit documents', 'Verification and approval'],
                deadline: 'Ongoing',
                sourceUrl: ''
            });
        }
    }
    return stateSchemes;
}

// Combine all and save
const allSchemes = [...generateFullSchemes(), ...generateStateSchemes()];
const outPath = path.join(__dirname, 'data', 'schemes.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
fs.writeFileSync(outPath, JSON.stringify(allSchemes, null, 2));
console.log(`Generated ${allSchemes.length} schemes -> ${outPath}`);
