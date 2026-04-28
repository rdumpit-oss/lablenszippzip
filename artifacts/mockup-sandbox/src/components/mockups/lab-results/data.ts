export type ResultStatus = "normal" | "low" | "high" | "critical";

export interface LabResult {
  name: string;
  value: string;
  referenceRange?: string;
  status: ResultStatus;
  explanation: string;
  possibleCauses?: string[];
  possibleRemedies?: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface LabResultsData {
  overallStatus: "normal" | "attention" | "concern";
  overallLabel: string;
  summary: string;
  results: LabResult[];
  questionsToAsk: string[];
  followUpQuestions: string[];
  glossary: GlossaryTerm[];
  analyzedDate: string;
}

export const SAMPLE_RESULTS: LabResultsData = {
  overallStatus: "attention",
  overallLabel: "Signs of possible infection",
  summary:
    "The urinalysis shows several abnormal findings, including hazy appearance, elevated white blood cells (Leukocytes and Pus Cells), and moderate bacteria. These results strongly suggest a possible urinary tract infection or inflammation. It is important to discuss these findings with a doctor for proper diagnosis and treatment.",
  analyzedDate: "April 28, 2026",
  results: [
    {
      name: "Color",
      value: "STRAW",
      status: "normal",
      explanation: "The color of your urine is normal.",
    },
    {
      name: "Appearance",
      value: "HAZY",
      status: "high",
      referenceRange: "Clear",
      explanation:
        "Your urine is not clear, which can be due to cells, bacteria, or crystals.",
      possibleCauses: [
        "Presence of cells, bacteria, or crystals",
        "Urinary tract infection (UTI)",
        "Inflammation",
      ],
      possibleRemedies: [
        "Discuss with your doctor for evaluation",
        "Ensure adequate hydration",
      ],
    },
    {
      name: "Reaction Ph (pH)",
      value: "7.5",
      referenceRange: "4.5–8.0",
      status: "normal",
      explanation:
        "The pH of your urine is slightly alkaline, which is within the normal range.",
    },
    {
      name: "Glucose",
      value: "NEGATIVE",
      referenceRange: "NEGATIVE",
      status: "normal",
      explanation: "No sugar was detected in your urine, which is a normal finding.",
    },
    {
      name: "Protein",
      value: "NEGATIVE",
      referenceRange: "NEGATIVE",
      status: "normal",
      explanation: "No protein was detected in your urine, which is a normal finding.",
    },
    {
      name: "Specific Gravity",
      value: "1.005",
      referenceRange: "1.003–1.030",
      status: "normal",
      explanation:
        "This value indicates how concentrated your urine is, and it is within the normal range.",
    },
    {
      name: "Leukocytes",
      value: "++",
      referenceRange: "NEGATIVE",
      status: "high",
      explanation:
        "A significant amount of white blood cells are present in your urine.",
      possibleCauses: [
        "Urinary tract infection (UTI)",
        "Kidney infection",
        "Inflammation",
      ],
      possibleRemedies: [
        "Consult your doctor for diagnosis and treatment",
        "Increase your fluid intake",
      ],
    },
    {
      name: "Urobilinogen",
      value: "NEGATIVE/TRACE",
      referenceRange: "NEGATIVE/TRACE",
      status: "normal",
      explanation: "No urobilinogen was detected in your urine, which is a normal finding.",
    },
    {
      name: "Blood",
      value: "NEGATIVE",
      referenceRange: "NEGATIVE",
      status: "normal",
      explanation: "No blood was detected in your urine, which is a normal finding.",
    },
    {
      name: "Ketone",
      value: "NEGATIVE",
      referenceRange: "NEGATIVE",
      status: "normal",
      explanation: "No ketones were detected in your urine, which is a normal finding.",
    },
    {
      name: "Bilirubin",
      value: "NEGATIVE",
      referenceRange: "NEGATIVE",
      status: "normal",
      explanation: "No bilirubin was detected in your urine, which is a normal finding.",
    },
    {
      name: "Nitrite",
      value: "NEGATIVE",
      referenceRange: "NEGATIVE",
      status: "normal",
      explanation: "No nitrites were detected in your urine, which is a normal finding.",
    },
    {
      name: "Pus Cells",
      value: "8–12 /HPF",
      referenceRange: "0–5 /HPF",
      status: "high",
      explanation:
        "An increased number of white blood cells are seen under the microscope.",
      possibleCauses: [
        "Urinary tract infection (UTI)",
        "Inflammation in the urinary system",
      ],
      possibleRemedies: [
        "Discuss with your doctor for further evaluation",
        "Ensure adequate hydration",
      ],
    },
    {
      name: "rbc (Red Blood Cells)",
      value: "1–3 /HPF",
      referenceRange: "0–2 /HPF",
      status: "normal",
      explanation:
        "A small number of red blood cells are present, which is usually within normal limits.",
    },
    {
      name: "Bacteria",
      value: "MODERATE",
      referenceRange: "NEGATIVE/FEW",
      status: "high",
      explanation: "A moderate amount of bacteria was observed in the urine sample.",
      possibleCauses: [
        "Urinary tract infection (UTI)",
        "Contamination during sample collection",
      ],
      possibleRemedies: [
        "Consult your doctor for diagnosis and treatment",
        "Practice proper hygiene during sample collection",
      ],
    },
    {
      name: "EPITHELIAL CELLS – Squamous",
      value: "ABUNDANT",
      referenceRange: "FEW",
      status: "high",
      explanation:
        "Many skin cells were found, possibly from contamination or inflammation.",
      possibleCauses: [
        "Contamination of the urine sample",
        "Inflammation of the urinary tract",
      ],
      possibleRemedies: [
        "Discuss with your doctor",
        "Ensure proper clean-catch technique for future samples",
      ],
    },
    {
      name: "EPITHELIAL CELLS – Transitional",
      value: "RARE",
      referenceRange: "RARE/FEW",
      status: "normal",
      explanation:
        "A small number of transitional epithelial cells were found, which is a normal finding.",
    },
  ],
  questionsToAsk: [
    "What do these abnormal results mean for my health?",
    "What are the next steps for diagnosis and treatment?",
    "Are there any lifestyle changes I should consider?",
  ],
  followUpQuestions: [
    "Could the hazy appearance be a sign of infection?",
    "What is causing the high levels of leukocytes and pus cells?",
    "Is the moderate bacteria count indicative of a UTI?",
    "How can I ensure a clean urine sample for future tests?",
  ],
  glossary: [
    { term: "urinalysis", definition: "A test of your urine to check for signs of disease." },
    { term: "Leukocytes", definition: "White blood cells; high levels can signal infection or inflammation." },
    { term: "Pus Cells", definition: "Dead white blood cells; often a sign of infection." },
    { term: "bacteria", definition: "Microorganisms; their presence in urine can indicate infection." },
    { term: "pus cells", definition: "Dead white blood cells; often a sign of infection." },
    { term: "leukocytes", definition: "White blood cells; high levels can signal infection or inflammation." },
  ],
};
