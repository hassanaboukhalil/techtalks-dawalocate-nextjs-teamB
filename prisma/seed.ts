import { db } from "../lib/db";

async function seed() {
  console.log("🌱 Starting seed...");

  // ============================================
  // 1. USER TYPES
  // ============================================
  await db.userType.createMany({
    data: [
      { name: "admin" },
      { name: "pharmacy" },
      { name: "charity" },
      { name: "patient" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Created user types");

  // ============================================
  // 2. MEDICINES - Comprehensive list
  // ============================================
  const medicines = [
    // Pain Relievers & Fever Reducers
    {
      name: "Paracetamol",
      genericName: "Acetaminophen",
      strength: "500mg",
      form: "Tablet",
      synonyms: "Tylenol, Panadol, Calpol",
      description: "Pain reliever and fever reducer. Used for headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
    },
    {
      name: "Paracetamol",
      genericName: "Acetaminophen",
      strength: "1000mg",
      form: "Tablet",
      synonyms: "Tylenol Extra Strength",
      description: "Extra strength pain reliever and fever reducer for moderate to severe pain.",
    },
    {
      name: "Paracetamol",
      genericName: "Acetaminophen",
      strength: "250mg/5ml",
      form: "Syrup",
      synonyms: "Children's Tylenol, Calpol",
      description: "Liquid pain reliever and fever reducer for children.",
    },
    {
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      strength: "200mg",
      form: "Tablet",
      synonyms: "Advil, Motrin, Nurofen",
      description: "Non-steroidal anti-inflammatory drug (NSAID) for pain, fever, and inflammation.",
    },
    {
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      strength: "400mg",
      form: "Tablet",
      synonyms: "Advil, Motrin",
      description: "Higher strength NSAID for moderate pain and inflammation.",
    },
    {
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      strength: "100mg/5ml",
      form: "Suspension",
      synonyms: "Children's Advil, Children's Motrin",
      description: "Liquid NSAID for children's pain and fever.",
    },
    {
      name: "Aspirin",
      genericName: "Acetylsalicylic acid",
      strength: "100mg",
      form: "Tablet",
      synonyms: "Bayer, Ecotrin",
      description: "Low-dose aspirin for cardiovascular protection.",
    },
    {
      name: "Aspirin",
      genericName: "Acetylsalicylic acid",
      strength: "325mg",
      form: "Tablet",
      synonyms: "Bayer Aspirin",
      description: "Pain reliever, fever reducer, and anti-inflammatory.",
    },
    {
      name: "Naproxen",
      genericName: "Naproxen sodium",
      strength: "250mg",
      form: "Tablet",
      synonyms: "Aleve, Naprosyn",
      description: "Long-acting NSAID for pain and inflammation.",
    },
    {
      name: "Naproxen",
      genericName: "Naproxen sodium",
      strength: "500mg",
      form: "Tablet",
      synonyms: "Naprosyn, Anaprox",
      description: "Prescription-strength NSAID for arthritis and severe pain.",
    },
    {
      name: "Diclofenac",
      genericName: "Diclofenac sodium",
      strength: "50mg",
      form: "Tablet",
      synonyms: "Voltaren, Cataflam",
      description: "NSAID for arthritis, muscle pain, and inflammation.",
    },
    {
      name: "Diclofenac",
      genericName: "Diclofenac sodium",
      strength: "1%",
      form: "Gel",
      synonyms: "Voltaren Gel",
      description: "Topical NSAID for localized muscle and joint pain.",
    },

    // Antibiotics
    {
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      strength: "500mg",
      form: "Capsule",
      synonyms: "Amoxil, Trimox",
      description: "Penicillin-type antibiotic for bacterial infections including respiratory, ear, nose, throat, skin, and urinary tract infections.",
    },
    {
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      strength: "250mg",
      form: "Capsule",
      synonyms: "Amoxil",
      description: "Lower strength penicillin antibiotic for mild infections.",
    },
    {
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      strength: "125mg/5ml",
      form: "Suspension",
      synonyms: "Amoxil Pediatric",
      description: "Liquid antibiotic for children.",
    },
    {
      name: "Amoxicillin-Clavulanate",
      genericName: "Amoxicillin/Clavulanic acid",
      strength: "625mg",
      form: "Tablet",
      synonyms: "Augmentin, Co-amoxiclav",
      description: "Combination antibiotic effective against resistant bacteria.",
    },
    {
      name: "Azithromycin",
      genericName: "Azithromycin",
      strength: "250mg",
      form: "Tablet",
      synonyms: "Zithromax, Z-Pack",
      description: "Macrolide antibiotic for respiratory infections, skin infections, and STIs.",
    },
    {
      name: "Azithromycin",
      genericName: "Azithromycin",
      strength: "500mg",
      form: "Tablet",
      synonyms: "Zithromax",
      description: "Higher strength macrolide antibiotic.",
    },
    {
      name: "Ciprofloxacin",
      genericName: "Ciprofloxacin",
      strength: "500mg",
      form: "Tablet",
      synonyms: "Cipro",
      description: "Fluoroquinolone antibiotic for urinary tract, respiratory, and gastrointestinal infections.",
    },
    {
      name: "Levofloxacin",
      genericName: "Levofloxacin",
      strength: "500mg",
      form: "Tablet",
      synonyms: "Levaquin",
      description: "Fluoroquinolone antibiotic for pneumonia and sinusitis.",
    },
    {
      name: "Metronidazole",
      genericName: "Metronidazole",
      strength: "400mg",
      form: "Tablet",
      synonyms: "Flagyl",
      description: "Antibiotic and antiprotozoal for anaerobic bacterial infections and parasites.",
    },
    {
      name: "Doxycycline",
      genericName: "Doxycycline",
      strength: "100mg",
      form: "Capsule",
      synonyms: "Vibramycin, Doryx",
      description: "Tetracycline antibiotic for acne, respiratory infections, and Lyme disease.",
    },
    {
      name: "Cephalexin",
      genericName: "Cephalexin",
      strength: "500mg",
      form: "Capsule",
      synonyms: "Keflex",
      description: "Cephalosporin antibiotic for skin, bone, and respiratory infections.",
    },
    {
      name: "Clarithromycin",
      genericName: "Clarithromycin",
      strength: "500mg",
      form: "Tablet",
      synonyms: "Biaxin, Klacid",
      description: "Macrolide antibiotic for respiratory and skin infections.",
    },

    // Gastrointestinal Medications
    {
      name: "Omeprazole",
      genericName: "Omeprazole",
      strength: "20mg",
      form: "Capsule",
      synonyms: "Prilosec, Losec",
      description: "Proton pump inhibitor for acid reflux, GERD, and stomach ulcers.",
    },
    {
      name: "Omeprazole",
      genericName: "Omeprazole",
      strength: "40mg",
      form: "Capsule",
      synonyms: "Prilosec",
      description: "Higher strength PPI for severe acid reflux.",
    },
    {
      name: "Esomeprazole",
      genericName: "Esomeprazole",
      strength: "40mg",
      form: "Tablet",
      synonyms: "Nexium",
      description: "Proton pump inhibitor for GERD and erosive esophagitis.",
    },
    {
      name: "Pantoprazole",
      genericName: "Pantoprazole",
      strength: "40mg",
      form: "Tablet",
      synonyms: "Protonix",
      description: "PPI for gastric acid-related conditions.",
    },
    {
      name: "Ranitidine",
      genericName: "Ranitidine",
      strength: "150mg",
      form: "Tablet",
      synonyms: "Zantac",
      description: "H2 blocker for heartburn and acid indigestion.",
    },
    {
      name: "Famotidine",
      genericName: "Famotidine",
      strength: "20mg",
      form: "Tablet",
      synonyms: "Pepcid",
      description: "H2 blocker for heartburn and GERD.",
    },
    {
      name: "Loperamide",
      genericName: "Loperamide",
      strength: "2mg",
      form: "Capsule",
      synonyms: "Imodium",
      description: "Anti-diarrheal medication.",
    },
    {
      name: "Ondansetron",
      genericName: "Ondansetron",
      strength: "4mg",
      form: "Tablet",
      synonyms: "Zofran",
      description: "Anti-nausea medication for chemotherapy and post-surgery.",
    },
    {
      name: "Ondansetron",
      genericName: "Ondansetron",
      strength: "8mg",
      form: "Tablet",
      synonyms: "Zofran",
      description: "Higher strength anti-emetic.",
    },
    {
      name: "Metoclopramide",
      genericName: "Metoclopramide",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Reglan, Maxolon",
      description: "Anti-nausea and gastroprokinetic agent.",
    },
    {
      name: "Domperidone",
      genericName: "Domperidone",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Motilium",
      description: "Anti-nausea medication that increases gut motility.",
    },

    // Cardiovascular Medications
    {
      name: "Amlodipine",
      genericName: "Amlodipine",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Norvasc",
      description: "Calcium channel blocker for high blood pressure and angina.",
    },
    {
      name: "Amlodipine",
      genericName: "Amlodipine",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Norvasc",
      description: "Higher strength calcium channel blocker.",
    },
    {
      name: "Lisinopril",
      genericName: "Lisinopril",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Zestril, Prinivil",
      description: "ACE inhibitor for high blood pressure and heart failure.",
    },
    {
      name: "Lisinopril",
      genericName: "Lisinopril",
      strength: "20mg",
      form: "Tablet",
      synonyms: "Zestril",
      description: "Higher strength ACE inhibitor.",
    },
    {
      name: "Losartan",
      genericName: "Losartan",
      strength: "50mg",
      form: "Tablet",
      synonyms: "Cozaar",
      description: "ARB for hypertension and diabetic kidney protection.",
    },
    {
      name: "Losartan",
      genericName: "Losartan",
      strength: "100mg",
      form: "Tablet",
      synonyms: "Cozaar",
      description: "Higher strength ARB.",
    },
    {
      name: "Atenolol",
      genericName: "Atenolol",
      strength: "50mg",
      form: "Tablet",
      synonyms: "Tenormin",
      description: "Beta blocker for hypertension and angina.",
    },
    {
      name: "Metoprolol",
      genericName: "Metoprolol",
      strength: "50mg",
      form: "Tablet",
      synonyms: "Lopressor, Toprol",
      description: "Beta blocker for high blood pressure and heart conditions.",
    },
    {
      name: "Propranolol",
      genericName: "Propranolol",
      strength: "40mg",
      form: "Tablet",
      synonyms: "Inderal",
      description: "Beta blocker for hypertension, anxiety, and tremors.",
    },
    {
      name: "Hydrochlorothiazide",
      genericName: "Hydrochlorothiazide",
      strength: "25mg",
      form: "Tablet",
      synonyms: "HCTZ, Microzide",
      description: "Thiazide diuretic for hypertension and fluid retention.",
    },
    {
      name: "Furosemide",
      genericName: "Furosemide",
      strength: "40mg",
      form: "Tablet",
      synonyms: "Lasix",
      description: "Loop diuretic for edema and heart failure.",
    },
    {
      name: "Atorvastatin",
      genericName: "Atorvastatin",
      strength: "20mg",
      form: "Tablet",
      synonyms: "Lipitor",
      description: "Statin for lowering cholesterol.",
    },
    {
      name: "Atorvastatin",
      genericName: "Atorvastatin",
      strength: "40mg",
      form: "Tablet",
      synonyms: "Lipitor",
      description: "Higher strength statin.",
    },
    {
      name: "Simvastatin",
      genericName: "Simvastatin",
      strength: "20mg",
      form: "Tablet",
      synonyms: "Zocor",
      description: "Statin for cholesterol management.",
    },
    {
      name: "Rosuvastatin",
      genericName: "Rosuvastatin",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Crestor",
      description: "Potent statin for high cholesterol.",
    },
    {
      name: "Clopidogrel",
      genericName: "Clopidogrel",
      strength: "75mg",
      form: "Tablet",
      synonyms: "Plavix",
      description: "Antiplatelet agent to prevent blood clots.",
    },
    {
      name: "Warfarin",
      genericName: "Warfarin",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Coumadin",
      description: "Anticoagulant blood thinner.",
    },

    // Diabetes Medications
    {
      name: "Metformin",
      genericName: "Metformin",
      strength: "500mg",
      form: "Tablet",
      synonyms: "Glucophage",
      description: "First-line medication for type 2 diabetes.",
    },
    {
      name: "Metformin",
      genericName: "Metformin",
      strength: "850mg",
      form: "Tablet",
      synonyms: "Glucophage",
      description: "Higher strength diabetes medication.",
    },
    {
      name: "Metformin",
      genericName: "Metformin",
      strength: "1000mg",
      form: "Tablet",
      synonyms: "Glucophage",
      description: "Maximum strength metformin tablet.",
    },
    {
      name: "Glibenclamide",
      genericName: "Glyburide",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Diabeta, Micronase",
      description: "Sulfonylurea for type 2 diabetes.",
    },
    {
      name: "Glimepiride",
      genericName: "Glimepiride",
      strength: "2mg",
      form: "Tablet",
      synonyms: "Amaryl",
      description: "Sulfonylurea to stimulate insulin release.",
    },
    {
      name: "Sitagliptin",
      genericName: "Sitagliptin",
      strength: "100mg",
      form: "Tablet",
      synonyms: "Januvia",
      description: "DPP-4 inhibitor for blood sugar control.",
    },
    {
      name: "Empagliflozin",
      genericName: "Empagliflozin",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Jardiance",
      description: "SGLT2 inhibitor for diabetes and heart protection.",
    },

    // Respiratory Medications
    {
      name: "Salbutamol",
      genericName: "Albuterol",
      strength: "100mcg",
      form: "Inhaler",
      synonyms: "Ventolin, ProAir",
      description: "Bronchodilator for asthma and COPD relief.",
    },
    {
      name: "Salbutamol",
      genericName: "Albuterol",
      strength: "2mg",
      form: "Tablet",
      synonyms: "Ventolin",
      description: "Oral bronchodilator for asthma.",
    },
    {
      name: "Budesonide",
      genericName: "Budesonide",
      strength: "200mcg",
      form: "Inhaler",
      synonyms: "Pulmicort",
      description: "Inhaled corticosteroid for asthma prevention.",
    },
    {
      name: "Fluticasone",
      genericName: "Fluticasone",
      strength: "250mcg",
      form: "Inhaler",
      synonyms: "Flovent",
      description: "Inhaled steroid for asthma maintenance.",
    },
    {
      name: "Montelukast",
      genericName: "Montelukast",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Singulair",
      description: "Leukotriene inhibitor for asthma and allergies.",
    },
    {
      name: "Cetirizine",
      genericName: "Cetirizine",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Zyrtec",
      description: "Second-generation antihistamine for allergies.",
    },
    {
      name: "Loratadine",
      genericName: "Loratadine",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Claritin",
      description: "Non-drowsy antihistamine for allergic rhinitis.",
    },
    {
      name: "Fexofenadine",
      genericName: "Fexofenadine",
      strength: "180mg",
      form: "Tablet",
      synonyms: "Allegra",
      description: "Non-sedating antihistamine for allergies.",
    },
    {
      name: "Diphenhydramine",
      genericName: "Diphenhydramine",
      strength: "25mg",
      form: "Capsule",
      synonyms: "Benadryl",
      description: "First-generation antihistamine for allergies and sleep aid.",
    },
    {
      name: "Pseudoephedrine",
      genericName: "Pseudoephedrine",
      strength: "60mg",
      form: "Tablet",
      synonyms: "Sudafed",
      description: "Decongestant for nasal and sinus congestion.",
    },
    {
      name: "Guaifenesin",
      genericName: "Guaifenesin",
      strength: "200mg",
      form: "Tablet",
      synonyms: "Mucinex",
      description: "Expectorant to loosen chest congestion.",
    },
    {
      name: "Dextromethorphan",
      genericName: "Dextromethorphan",
      strength: "15mg",
      form: "Syrup",
      synonyms: "Robitussin DM",
      description: "Cough suppressant.",
    },
    {
      name: "Prednisolone",
      genericName: "Prednisolone",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Prelone",
      description: "Oral corticosteroid for inflammation and allergies.",
    },
    {
      name: "Prednisone",
      genericName: "Prednisone",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Deltasone",
      description: "Corticosteroid for severe inflammation.",
    },

    // Mental Health Medications
    {
      name: "Sertraline",
      genericName: "Sertraline",
      strength: "50mg",
      form: "Tablet",
      synonyms: "Zoloft",
      description: "SSRI antidepressant for depression and anxiety.",
    },
    {
      name: "Escitalopram",
      genericName: "Escitalopram",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Lexapro",
      description: "SSRI for depression and generalized anxiety.",
    },
    {
      name: "Fluoxetine",
      genericName: "Fluoxetine",
      strength: "20mg",
      form: "Capsule",
      synonyms: "Prozac",
      description: "SSRI for depression, OCD, and panic disorder.",
    },
    {
      name: "Paroxetine",
      genericName: "Paroxetine",
      strength: "20mg",
      form: "Tablet",
      synonyms: "Paxil",
      description: "SSRI for depression and anxiety disorders.",
    },
    {
      name: "Venlafaxine",
      genericName: "Venlafaxine",
      strength: "75mg",
      form: "Capsule",
      synonyms: "Effexor",
      description: "SNRI for depression and anxiety.",
    },
    {
      name: "Duloxetine",
      genericName: "Duloxetine",
      strength: "30mg",
      form: "Capsule",
      synonyms: "Cymbalta",
      description: "SNRI for depression, anxiety, and nerve pain.",
    },
    {
      name: "Amitriptyline",
      genericName: "Amitriptyline",
      strength: "25mg",
      form: "Tablet",
      synonyms: "Elavil",
      description: "Tricyclic antidepressant also used for nerve pain.",
    },
    {
      name: "Alprazolam",
      genericName: "Alprazolam",
      strength: "0.5mg",
      form: "Tablet",
      synonyms: "Xanax",
      description: "Benzodiazepine for anxiety and panic disorders.",
    },
    {
      name: "Diazepam",
      genericName: "Diazepam",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Valium",
      description: "Benzodiazepine for anxiety, muscle spasms, and seizures.",
    },
    {
      name: "Lorazepam",
      genericName: "Lorazepam",
      strength: "1mg",
      form: "Tablet",
      synonyms: "Ativan",
      description: "Benzodiazepine for anxiety and insomnia.",
    },
    {
      name: "Zolpidem",
      genericName: "Zolpidem",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Ambien",
      description: "Sleep aid for insomnia.",
    },
    {
      name: "Quetiapine",
      genericName: "Quetiapine",
      strength: "25mg",
      form: "Tablet",
      synonyms: "Seroquel",
      description: "Antipsychotic for schizophrenia and bipolar disorder.",
    },
    {
      name: "Risperidone",
      genericName: "Risperidone",
      strength: "2mg",
      form: "Tablet",
      synonyms: "Risperdal",
      description: "Antipsychotic medication.",
    },

    // Thyroid Medications
    {
      name: "Levothyroxine",
      genericName: "Levothyroxine",
      strength: "50mcg",
      form: "Tablet",
      synonyms: "Synthroid, Euthyrox",
      description: "Thyroid hormone replacement for hypothyroidism.",
    },
    {
      name: "Levothyroxine",
      genericName: "Levothyroxine",
      strength: "100mcg",
      form: "Tablet",
      synonyms: "Synthroid",
      description: "Higher strength thyroid replacement.",
    },
    {
      name: "Carbimazole",
      genericName: "Carbimazole",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Neo-Mercazole",
      description: "Anti-thyroid medication for hyperthyroidism.",
    },

    // Vitamins & Supplements
    {
      name: "Vitamin D3",
      genericName: "Cholecalciferol",
      strength: "1000IU",
      form: "Tablet",
      synonyms: "D3, Cholecalciferol",
      description: "Vitamin D supplement for bone health.",
    },
    {
      name: "Vitamin D3",
      genericName: "Cholecalciferol",
      strength: "50000IU",
      form: "Capsule",
      synonyms: "High-dose Vitamin D",
      description: "High-dose vitamin D for deficiency treatment.",
    },
    {
      name: "Vitamin B12",
      genericName: "Cyanocobalamin",
      strength: "1000mcg",
      form: "Tablet",
      synonyms: "B12, Cyanocobalamin",
      description: "B12 supplement for deficiency and anemia.",
    },
    {
      name: "Folic Acid",
      genericName: "Folic acid",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Vitamin B9, Folate",
      description: "B vitamin essential for pregnancy and cell growth.",
    },
    {
      name: "Iron",
      genericName: "Ferrous sulfate",
      strength: "325mg",
      form: "Tablet",
      synonyms: "Feosol, Fer-In-Sol",
      description: "Iron supplement for anemia.",
    },
    {
      name: "Calcium",
      genericName: "Calcium carbonate",
      strength: "500mg",
      form: "Tablet",
      synonyms: "Caltrate, Os-Cal",
      description: "Calcium supplement for bone health.",
    },
    {
      name: "Multivitamin",
      genericName: "Multivitamin",
      strength: "Standard",
      form: "Tablet",
      synonyms: "Centrum, One-A-Day",
      description: "Daily multivitamin supplement.",
    },
    {
      name: "Omega-3",
      genericName: "Fish oil",
      strength: "1000mg",
      form: "Capsule",
      synonyms: "Fish Oil, EPA/DHA",
      description: "Omega-3 fatty acids for heart and brain health.",
    },

    // Skin & Topical
    {
      name: "Hydrocortisone",
      genericName: "Hydrocortisone",
      strength: "1%",
      form: "Cream",
      synonyms: "Cortaid",
      description: "Topical steroid for skin inflammation and itching.",
    },
    {
      name: "Betamethasone",
      genericName: "Betamethasone",
      strength: "0.1%",
      form: "Cream",
      synonyms: "Betnovate",
      description: "Stronger topical steroid for eczema and dermatitis.",
    },
    {
      name: "Clotrimazole",
      genericName: "Clotrimazole",
      strength: "1%",
      form: "Cream",
      synonyms: "Lotrimin, Canesten",
      description: "Antifungal cream for athlete's foot and ringworm.",
    },
    {
      name: "Miconazole",
      genericName: "Miconazole",
      strength: "2%",
      form: "Cream",
      synonyms: "Monistat, Daktarin",
      description: "Antifungal for yeast and fungal infections.",
    },
    {
      name: "Mupirocin",
      genericName: "Mupirocin",
      strength: "2%",
      form: "Ointment",
      synonyms: "Bactroban",
      description: "Topical antibiotic for skin infections.",
    },
    {
      name: "Fusidic Acid",
      genericName: "Fusidic acid",
      strength: "2%",
      form: "Cream",
      synonyms: "Fucidin",
      description: "Topical antibiotic for bacterial skin infections.",
    },
    {
      name: "Benzoyl Peroxide",
      genericName: "Benzoyl peroxide",
      strength: "5%",
      form: "Gel",
      synonyms: "Clearasil, PanOxyl",
      description: "Acne treatment that kills bacteria.",
    },
    {
      name: "Adapalene",
      genericName: "Adapalene",
      strength: "0.1%",
      form: "Gel",
      synonyms: "Differin",
      description: "Retinoid for acne treatment.",
    },
    {
      name: "Permethrin",
      genericName: "Permethrin",
      strength: "5%",
      form: "Cream",
      synonyms: "Elimite, Nix",
      description: "Treatment for scabies and lice.",
    },

    // Eye & Ear
    {
      name: "Chloramphenicol",
      genericName: "Chloramphenicol",
      strength: "0.5%",
      form: "Eye drops",
      synonyms: "Chloromycetin",
      description: "Antibiotic eye drops for bacterial conjunctivitis.",
    },
    {
      name: "Ciprofloxacin",
      genericName: "Ciprofloxacin",
      strength: "0.3%",
      form: "Eye drops",
      synonyms: "Ciloxan",
      description: "Fluoroquinolone eye drops for eye infections.",
    },
    {
      name: "Artificial Tears",
      genericName: "Carboxymethylcellulose",
      strength: "0.5%",
      form: "Eye drops",
      synonyms: "Refresh, Systane",
      description: "Lubricating eye drops for dry eyes.",
    },
    {
      name: "Timolol",
      genericName: "Timolol",
      strength: "0.5%",
      form: "Eye drops",
      synonyms: "Timoptic",
      description: "Beta blocker eye drops for glaucoma.",
    },
    {
      name: "Ciprofloxacin",
      genericName: "Ciprofloxacin",
      strength: "0.3%",
      form: "Ear drops",
      synonyms: "Cetraxal",
      description: "Antibiotic ear drops for otitis externa.",
    },

    // Muscle Relaxants & Pain Management
    {
      name: "Cyclobenzaprine",
      genericName: "Cyclobenzaprine",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Flexeril",
      description: "Muscle relaxant for acute musculoskeletal pain.",
    },
    {
      name: "Baclofen",
      genericName: "Baclofen",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Lioresal",
      description: "Muscle relaxant for spasticity.",
    },
    {
      name: "Tizanidine",
      genericName: "Tizanidine",
      strength: "4mg",
      form: "Tablet",
      synonyms: "Zanaflex",
      description: "Muscle relaxant for muscle spasms.",
    },
    {
      name: "Tramadol",
      genericName: "Tramadol",
      strength: "50mg",
      form: "Capsule",
      synonyms: "Ultram",
      description: "Opioid-like pain reliever for moderate pain.",
    },
    {
      name: "Gabapentin",
      genericName: "Gabapentin",
      strength: "300mg",
      form: "Capsule",
      synonyms: "Neurontin",
      description: "For nerve pain and seizures.",
    },
    {
      name: "Pregabalin",
      genericName: "Pregabalin",
      strength: "75mg",
      form: "Capsule",
      synonyms: "Lyrica",
      description: "For nerve pain, fibromyalgia, and seizures.",
    },

    // Contraceptives & Hormones
    {
      name: "Levonorgestrel/Ethinylestradiol",
      genericName: "Levonorgestrel/Ethinyl estradiol",
      strength: "0.15mg/0.03mg",
      form: "Tablet",
      synonyms: "Microgynon, Nordette",
      description: "Combined oral contraceptive pill.",
    },
    {
      name: "Levonorgestrel",
      genericName: "Levonorgestrel",
      strength: "1.5mg",
      form: "Tablet",
      synonyms: "Plan B, Morning After",
      description: "Emergency contraceptive.",
    },
    {
      name: "Medroxyprogesterone",
      genericName: "Medroxyprogesterone",
      strength: "10mg",
      form: "Tablet",
      synonyms: "Provera",
      description: "Progestin for menstrual disorders.",
    },

    // Other Common Medications
    {
      name: "Allopurinol",
      genericName: "Allopurinol",
      strength: "100mg",
      form: "Tablet",
      synonyms: "Zyloprim",
      description: "Uric acid reducer for gout prevention.",
    },
    {
      name: "Colchicine",
      genericName: "Colchicine",
      strength: "0.5mg",
      form: "Tablet",
      synonyms: "Colcrys",
      description: "Anti-inflammatory for acute gout attacks.",
    },
    {
      name: "Sildenafil",
      genericName: "Sildenafil",
      strength: "50mg",
      form: "Tablet",
      synonyms: "Viagra",
      description: "PDE5 inhibitor for erectile dysfunction.",
    },
    {
      name: "Tamsulosin",
      genericName: "Tamsulosin",
      strength: "0.4mg",
      form: "Capsule",
      synonyms: "Flomax",
      description: "Alpha blocker for enlarged prostate (BPH).",
    },
    {
      name: "Finasteride",
      genericName: "Finasteride",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Proscar",
      description: "5-alpha reductase inhibitor for BPH.",
    },
    {
      name: "Oxybutynin",
      genericName: "Oxybutynin",
      strength: "5mg",
      form: "Tablet",
      synonyms: "Ditropan",
      description: "Anticholinergic for overactive bladder.",
    },
  ];

  console.log(`📦 Seeding ${medicines.length} medicines...`);

  for (const med of medicines) {
    const existing = await db.medicine.findFirst({
      where: {
        name: med.name,
        strength: med.strength,
        form: med.form,
      },
    });

    if (!existing) {
      await db.medicine.create({ data: med });
      console.log(`✅ Created: ${med.name} ${med.strength} ${med.form}`);
    } else {
      console.log(`⏭️  Skipped (exists): ${med.name} ${med.strength} ${med.form}`);
    }
  }

  // ============================================
  // 3. SAMPLE USERS (for testing)
  // ============================================
  console.log("\n👤 Creating sample users...");

  const userTypes = await db.userType.findMany();
  const adminType = userTypes.find(t => t.name === "admin");
  const pharmacyType = userTypes.find(t => t.name === "pharmacy");
  const charityType = userTypes.find(t => t.name === "charity");
  const patientType = userTypes.find(t => t.name === "patient");

  // Sample Admin
  const existingAdmin = await db.user.findUnique({ where: { email: "admin@dawalocate.com" } });
  if (!existingAdmin && adminType) {
    await db.user.create({
      data: {
        name: "System Admin",
        email: "admin@dawalocate.com",
        passwordHash: "$2b$10$placeholder_hash_for_testing", // Replace with actual hash
        userTypeId: adminType.id,
        city: "Beirut",
        phone: "+961 1 234 567",
      },
    });
    console.log("✅ Created admin user");
  }

  // Sample Pharmacies
  const pharmacies = [
    {
      name: "City Pharmacy",
      email: "city@pharmacy.com",
      city: "Beirut",
      address: "Hamra Street, Beirut",
      phone: "+961 1 345 678",
      openingHours: "8:00 AM - 10:00 PM",
      hasDelivery: true,
      status: "APPROVED" as const,
    },
    {
      name: "Health Plus Pharmacy",
      email: "healthplus@pharmacy.com",
      city: "Tripoli",
      address: "Al-Mina Road, Tripoli",
      phone: "+961 6 234 567",
      openingHours: "9:00 AM - 9:00 PM",
      hasDelivery: true,
      status: "APPROVED" as const,
    },
    {
      name: "Care Pharmacy",
      email: "care@pharmacy.com",
      city: "Sidon",
      address: "Riad Al-Solh Street, Sidon",
      phone: "+961 7 123 456",
      openingHours: "8:30 AM - 8:30 PM",
      hasDelivery: false,
      status: "APPROVED" as const,
    },
    {
      name: "MedCenter Pharmacy",
      email: "medcenter@pharmacy.com",
      city: "Jounieh",
      address: "Kaslik Main Road, Jounieh",
      phone: "+961 9 876 543",
      openingHours: "24 Hours",
      hasDelivery: true,
      status: "APPROVED" as const,
    },
  ];

  if (pharmacyType) {
    for (const pharm of pharmacies) {
      const existing = await db.user.findUnique({ where: { email: pharm.email } });
      if (!existing) {
        await db.user.create({
          data: {
            name: pharm.name,
            email: pharm.email,
            passwordHash: "$2b$10$placeholder_hash_for_testing",
            userTypeId: pharmacyType.id,
            city: pharm.city,
            address: pharm.address,
            phone: pharm.phone,
            openingHours: pharm.openingHours,
            hasDelivery: pharm.hasDelivery,
            status: pharm.status,
          },
        });
        console.log(`✅ Created pharmacy: ${pharm.name}`);
      }
    }
  }

  // Sample Charity
  const existingCharity = await db.user.findUnique({ where: { email: "redcross@charity.org" } });
  if (!existingCharity && charityType) {
    await db.user.create({
      data: {
        name: "Lebanese Red Cross",
        email: "redcross@charity.org",
        passwordHash: "$2b$10$placeholder_hash_for_testing",
        userTypeId: charityType.id,
        city: "Beirut",
        address: "Spears Street, Beirut",
        phone: "+961 1 372 802",
        status: "APPROVED",
      },
    });
    console.log("✅ Created charity user");
  }

  // Sample Patients
  const patients = [
    { name: "Ahmad Hassan", email: "ahmad@patient.com", city: "Beirut" },
    { name: "Sara Khoury", email: "sara@patient.com", city: "Tripoli" },
    { name: "Michel Haddad", email: "michel@patient.com", city: "Jounieh" },
  ];

  if (patientType) {
    for (const patient of patients) {
      const existing = await db.user.findUnique({ where: { email: patient.email } });
      if (!existing) {
        await db.user.create({
          data: {
            name: patient.name,
            email: patient.email,
            passwordHash: "$2b$10$placeholder_hash_for_testing",
            userTypeId: patientType.id,
            city: patient.city,
          },
        });
        console.log(`✅ Created patient: ${patient.name}`);
      }
    }
  }

  // ============================================
  // 4. PHARMACY INVENTORY (Sample data)
  // ============================================
  console.log("\n📦 Creating pharmacy inventory...");

  const allPharmacies = await db.user.findMany({
    where: { userType: { name: "pharmacy" } },
  });
  const allMedicines = await db.medicine.findMany();

  for (const pharmacy of allPharmacies) {
    // Each pharmacy gets random selection of medicines
    const selectedMedicines = allMedicines
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 30) + 20); // 20-50 medicines per pharmacy

    for (const medicine of selectedMedicines) {
      const existing = await db.pharmacyMedicine.findFirst({
        where: {
          pharmacyId: pharmacy.id,
          medicineId: medicine.id,
        },
      });

      if (!existing) {
        const quantity = Math.floor(Math.random() * 100) + 1;
        let status: "IN_STOCK" | "LOW" | "OUT" = "IN_STOCK";
        if (quantity === 0) status = "OUT";
        else if (quantity < 10) status = "LOW";

        // Random expiry date 6-24 months from now
        const expiryMonths = Math.floor(Math.random() * 18) + 6;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + expiryMonths);

        await db.pharmacyMedicine.create({
          data: {
            pharmacyId: pharmacy.id,
            medicineId: medicine.id,
            quantity,
            status,
            expiresAt,
          },
        });
      }
    }
    console.log(`✅ Added inventory for: ${pharmacy.name}`);
  }

  // ============================================
  // 5. SAMPLE DONATION OFFERS
  // ============================================
  console.log("\n🎁 Creating sample donation offers...");

  const donatingPatients = await db.user.findMany({
    where: { userType: { name: "patient" } },
    take: 2,
  });

  const donationMedicines = allMedicines.slice(0, 5);

  for (const patient of donatingPatients) {
    for (const medicine of donationMedicines.slice(0, 2)) {
      const existing = await db.donationOffer.findFirst({
        where: {
          userId: patient.id,
          medicineId: medicine.id,
        },
      });

      if (!existing) {
        const expiryMonths = Math.floor(Math.random() * 12) + 3;
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + expiryMonths);

        await db.donationOffer.create({
          data: {
            userId: patient.id,
            medicineId: medicine.id,
            city: patient.city || "Beirut",
            expiry,
            notes: "Unused medication, original packaging",
            status: "OPEN",
          },
        });
        console.log(`✅ Created donation offer: ${medicine.name} by ${patient.name}`);
      }
    }
  }

  // ============================================
  // 6. SAMPLE DONATION REQUESTS
  // ============================================
  console.log("\n📋 Creating sample donation requests...");

  const requestingPatients = await db.user.findMany({
    where: { userType: { name: "patient" } },
  });

  for (const patient of requestingPatients) {
    const requestMedicine = donationMedicines[Math.floor(Math.random() * donationMedicines.length)];

    const existing = await db.donationRequest.findFirst({
      where: {
        userId: patient.id,
        medicineId: requestMedicine.id,
      },
    });

    if (!existing) {
      await db.donationRequest.create({
        data: {
          userId: patient.id,
          medicineId: requestMedicine.id,
          city: patient.city || "Beirut",
          status: "OPEN",
        },
      });
      console.log(`✅ Created donation request: ${requestMedicine.name} for ${patient.name}`);
    }
  }

  // ============================================
  // 7. SAMPLE CAMPAIGN
  // ============================================
  console.log("\n📢 Creating sample campaign...");

  const charity = await db.user.findFirst({
    where: { userType: { name: "charity" } },
  });

  if (charity) {
    const existingCampaign = await db.campaign.findFirst({
      where: { charityUserId: charity.id },
    });

    if (!existingCampaign) {
      const campaign = await db.campaign.create({
        data: {
          charityUserId: charity.id,
          title: "Free Medicine Distribution - Beirut",
          description: "Monthly distribution of essential medicines to families in need. Bring your ID and prescription.",
          targetAreas: "Beirut, Dahieh, Bourj Hammoud",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          contactInfo: "+961 1 372 802 | redcross@charity.org",
        },
      });

      // Add medicines to campaign
      const campaignMeds = allMedicines.slice(0, 10);
      for (const med of campaignMeds) {
        await db.campaignMedicine.create({
          data: {
            campaignId: campaign.id,
            medicineId: med.id,
          },
        });
      }
      console.log("✅ Created campaign with medicines");
    }
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - Medicines: ${await db.medicine.count()}`);
  console.log(`   - Users: ${await db.user.count()}`);
  console.log(`   - Pharmacy Inventory: ${await db.pharmacyMedicine.count()}`);
  console.log(`   - Donation Offers: ${await db.donationOffer.count()}`);
  console.log(`   - Donation Requests: ${await db.donationRequest.count()}`);
  console.log(`   - Campaigns: ${await db.campaign.count()}`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
