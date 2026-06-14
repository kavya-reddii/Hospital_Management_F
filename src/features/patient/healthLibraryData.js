const diseasesAndConditions = [
  "Amyotrophic Lateral Sclerosis (ALS)",
  "Bone Marrow Transplant",
  "Brain Cancer",
  "Breast Cancer",
  "Chronic Kidney Disease (CKD)",
  "Colorectal Cancer",
  "Coronary Artery Disease",
  "Diabetes Mellitus",
  "Epilepsy",
  "Hypertension (High Blood Pressure)",
  "Irritable Bowel Syndrome (IBS)",
  "Kidney Stones",
  "Leukemia",
  "Liver Cirrhosis",
  "Osteoarthritis",
  "PCOD/PCOS",
  "Parkinson's Disease",
  "Rheumatoid Arthritis",
  "Skin Conditions",
  "Stroke",
  "Thyroid Disorders"
];

const treatmentsAndProcedures = [
  "Angioplasty & Stent",
  "Knee Replacement",
  "Bone Marrow Transplantation (BMT)",
  "CABG",
  "CART CELL Therapy",
  "Cholecystectomy (Gall Bladder Removal)",
  "Laparoscopic Cholecystectomy",
  "Hysterectomy",
  "Kidney Transplant",
  "Lithotripsy & Kidney Stone removal",
  "Liver Transplant",
  "Lung Transplant",
  "Mitral Valve Repair",
  "Hip Arthroscopy",
  "Total Hip Replacement (THR)",
  "Proton Therapy"
];

const symptomsGuide = [
  "Acute Chest Pain",
  "Hemoptysis (Coughing up Blood)",
  "Excessive Urination",
  "Blurred Vision",
  "Paralysis or Severe Numbness",
  "Cervical lymphadenopathy",
  "Esophoria",
  "Severe Headache with Neurological Symptoms",
  "Severe Leg Swelling or Deep Vein Thrombosis",
  "Blue sclera",
  "Gastrointestinal or Uncontrolled Bleeding",
  "Adult jaundice"
];

const healthTechnology = [
  "DaVinci XI-Robotic Systems",
  "CyberKnife-Accuray",
  "Meril Cuvis Robotics",
  "Cori by Smith & Nephew",
  "Stryker by Mako",
  "3D Neuro-navigation System",
  "3 TESLA MRI",
  "LINAC",
  "ECMO",
  "MOSES 2.0 System",
  "Rezum Water Vapor Therapy",
  "128 Slice CT SCAN"
];

const medicines = [
  "Adapalene",
  "Astaxanthin",
  "Deflazacort",
  "Glycine",
  "L-Arginine",
  "Methylcobalamin",
  "Oxymetholone",
  "Tadalafil",
  "Vonoprazan"
];

const diagnosticsAndTests = [
  "MRI (Magnetic Resonance Imaging)",
  "CT Scan (Computed Tomography)",
  "PET-CT Scan",
  "Coronary Angiogram",
  "Echocardiogram (ECHO)",
  "Electrocardiogram (ECG)",
  "Endoscopy & Colonoscopy",
  "SGPT Test",
  "Pulmonary Function Test (PFT)",
  "Liver Function Tests (LFT)",
  "Complete Blood Count (CBC)",
  "Kidney function Test (KFT)",
  "Wellness & Lifestyle"
];

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const healthLibraryCategories = [
  {
    key: "diseases-and-conditions",
    label: "Diseases and Conditions",
    items: diseasesAndConditions
  },
  {
    key: "treatments-and-procedures",
    label: "Treatments & Procedures",
    items: treatmentsAndProcedures
  },
  {
    key: "symptoms-guide",
    label: "Symptoms Guide",
    items: symptomsGuide
  },
  {
    key: "health-technology",
    label: "Health Technology",
    items: healthTechnology
  },
  {
    key: "medicines",
    label: "Medicines",
    items: medicines
  },
  {
    key: "diagnostics-and-tests",
    label: "Diagnostics & Tests",
    items: diagnosticsAndTests
  }
];

export const getCategoryByKey = (categoryKey) =>
  healthLibraryCategories.find((category) => category.key === categoryKey);

export const getArticleBySlug = (categoryKey, articleSlug) => {
  const category = getCategoryByKey(categoryKey);
  if (!category) return null;
  const item = category.items.find((name) => slugify(name) === articleSlug);
  if (!item) return null;
  return { category, item };
};
