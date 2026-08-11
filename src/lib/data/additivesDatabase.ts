export interface AdditiveDossier {
  eNumber: string;
  name: string;
  category: 'Emulsifier' | 'Preservative' | 'Synthetic Colorant' | 'Stabilizer' | 'Sweetener' | 'Flavor Enhancer' | 'Antioxidant';
  riskLevel: 'low' | 'moderate' | 'high';
  whoEfsaStatus: string;
  sideEffects: string[];
  regulatoryRestrictions: {
    eu: string;
    usa: string;
  };
  summary: string;
}

export const ADDITIVES_DATABASE: Record<string, AdditiveDossier> = {
  E150: {
    eNumber: 'E150',
    name: 'Caramel Color IV (Sulfite Ammonia Caramel)',
    category: 'Synthetic Colorant',
    riskLevel: 'high',
    whoEfsaStatus: 'EFSA re-evaluated in 2011; set acceptable daily intake (ADI) to 300 mg/kg bw/day due to 4-MEI byproduct concerns.',
    sideEffects: [
      'Contains 4-methylimidazole (4-MEI) formed during high-temperature processing',
      'Classified by IARC as a Group 2B possible human carcinogen',
      'May trigger immune hypersensitivity in sensitive individuals',
    ],
    regulatoryRestrictions: {
      eu: 'Permitted with strict maximum limits on 4-MEI contaminants.',
      usa: 'FDA approved; California Proposition 65 requires cancer warning labels for products with high 4-MEI.',
    },
    summary: 'Industrial brown colorant manufactured by heating carbohydrates with ammonium and sulfite compounds.',
  },
  E211: {
    eNumber: 'E211',
    name: 'Sodium Benzoate',
    category: 'Preservative',
    riskLevel: 'high',
    whoEfsaStatus: 'WHO & EFSA warn against co-formulation with ascorbic acid (Vitamin C). Southampton study linked to pediatric hyperactivity.',
    sideEffects: [
      'Forms Benzene (a known human carcinogen) when combined with Vitamin C in acidic beverages',
      'Increased risk of ADHD and hyperactivity symptoms in children',
      'Triggers histamine release, asthma flares, and urticaria (hives)',
    ],
    regulatoryRestrictions: {
      eu: 'Strictly capped at 150-500 mg/kg depending on food category; warning mandatory in citrus drinks.',
      usa: 'FDA designated GRAS (Generally Recognized as Safe) up to a 0.1% concentration limit.',
    },
    summary: 'Widely used chemical preservative inhibiting mold and yeast growth in acidic beverages and sauces.',
  },
  E320: {
    eNumber: 'E320',
    name: 'BHA (Butylated Hydroxyanisole)',
    category: 'Antioxidant',
    riskLevel: 'high',
    whoEfsaStatus: 'Classified by NIH & IARC as reasonably anticipated to be a human carcinogen and endocrine disruptor.',
    sideEffects: [
      'Endocrine disruption interfering with thyroid and steroid hormone balance',
      'Induction of forestomach tumors in rodent long-term toxicology trials',
      'Bioaccumulation in human adipose tissue',
    ],
    regulatoryRestrictions: {
      eu: 'Banned in baby foods; restricted to low limits in chewing gum and fats.',
      usa: 'Permitted by FDA up to 0.02% of total fat content.',
    },
    summary: 'Synthetic antioxidant added to fats, oils, and snack packaging to prevent rancidity.',
  },
  E322: {
    eNumber: 'E322',
    name: 'Lecithin (Soy / Sunflower Lecithin)',
    category: 'Emulsifier',
    riskLevel: 'low',
    whoEfsaStatus: 'EFSA evaluated in 2017: No safety concern at reported use levels. No ADI numerical limit needed.',
    sideEffects: [
      'Soy lecithin may contain trace soy protein allergens',
      'Generally very well tolerated with natural phospholipid benefit for cell membranes',
    ],
    regulatoryRestrictions: {
      eu: 'Approved under quantum satis (no limit, use minimum necessary).',
      usa: 'FDA GRAS approved.',
    },
    summary: 'Naturally occurring phospholipid extracted from soybeans or sunflower seeds used to blend fat and water.',
  },
  E407: {
    eNumber: 'E407',
    name: 'Carrageenan',
    category: 'Stabilizer',
    riskLevel: 'high',
    whoEfsaStatus: 'EFSA re-evaluating safety due to GI inflammation concerns. Degraded carrageenan (poligeenan) is prohibited.',
    sideEffects: [
      'Induction of intestinal inflammation and ulcerations in animal models',
      'Disruption of intestinal epithelial mucosal integrity ("leaky gut")',
      'Exacerbation of inflammatory bowel disease (IBD) and colitis',
    ],
    regulatoryRestrictions: {
      eu: 'Prohibited in infant formulas; permitted in dairy products pending final EFSA review.',
      usa: 'FDA permitted, though consumer groups advocate for removal from organic dairy.',
    },
    summary: 'Red seaweed polysaccharide used to thicken, gel, and stabilize milk products and plant-based milks.',
  },
  E471: {
    eNumber: 'E471',
    name: 'Mono- and Diglycerides of Fatty Acids',
    category: 'Emulsifier',
    riskLevel: 'moderate',
    whoEfsaStatus: 'EFSA re-evaluated in 2017. May contain trace trans fats and industrial process contaminants (3-MCPD).',
    sideEffects: [
      'May contain small amounts of trans fatty acids formed during industrial hydrogenation',
      'Emulsifier action can alter gut microbiota composition and mucosal layer thickness',
      'Contaminant 3-MCPD esters formed during high-heat oil refining',
    ],
    regulatoryRestrictions: {
      eu: 'Permitted in processed foods; EFSA set new strict maximum limits for 3-MCPD contaminants in 2021.',
      usa: 'FDA GRAS approved.',
    },
    summary: 'Synthetic emulsifier produced from glycerol and fatty acids to extend bread softness and prevent oil separation.',
  },
  E129: {
    eNumber: 'E129',
    name: 'Allura Red AC (Red 40)',
    category: 'Synthetic Colorant',
    riskLevel: 'high',
    whoEfsaStatus: 'Part of the "Southampton Six" colors linked to pediatric attention deficit disorders.',
    sideEffects: [
      'Increased risk of hyperactivity and behavioral issues in children',
      'Potential intestinal inflammation triggered by azo dye metabolites',
      'Allergic skin reactions and rhinitis in sensitive individuals',
    ],
    regulatoryRestrictions: {
      eu: 'Mandatory packaging warning label: "May have an adverse effect on activity and attention in children."',
      usa: 'FDA approved; widely used in candies, sodas, and cereals.',
    },
    summary: 'Azo dye synthesized from petroleum distillates providing vibrant red coloration.',
  },
  E120: {
    eNumber: 'E120',
    name: 'Carmine / Cochineal Extract',
    category: 'Synthetic Colorant',
    riskLevel: 'moderate',
    whoEfsaStatus: 'EFSA requires clear labeling due to documented severe IgE-mediated allergic reactions.',
    sideEffects: [
      'Severe allergic reactions, anaphylactic shock, and facial swelling in sensitive consumers',
      'Not suitable for vegan, vegetarian, or kosher diets (insect-derived)',
    ],
    regulatoryRestrictions: {
      eu: 'Mandatory clear declaration as "Carmine" or "E120" in ingredient lists.',
      usa: 'FDA requires explicit declaration by name ("Carmine" or "Cochineal Extract").',
    },
    summary: 'Natural deep-red pigment extracted from crushed female cochineal insects.',
  },
  E339: {
    eNumber: 'E339',
    name: 'Sodium Phosphate',
    category: 'Emulsifier',
    riskLevel: 'moderate',
    whoEfsaStatus: 'EFSA established a group ADI of 40 mg/kg bw/day for phosphates in 2019 due to renal burden.',
    sideEffects: [
      'High serum phosphate levels linked to vascular calcification and cardiovascular strain',
      'Accelerated bone density loss when dietary calcium-to-phosphate ratio is imbalanced',
      'Stress on kidney filtration in individuals with mild renal impairment',
    ],
    regulatoryRestrictions: {
      eu: 'Subject to numerical maximum limits across food categories.',
      usa: 'FDA GRAS approved.',
    },
    summary: 'Inorganic phosphate salt used as an emulsifying agent, pH buffer, and moisture retention agent in processed foods.',
  },
};

/**
 * Returns dossier for an additive by E-number or name, or a default generated dossier if unlisted.
 */
export function getAdditiveDossier(eNumberOrName: string): AdditiveDossier {
  const cleanKey = eNumberOrName.toUpperCase().match(/E\d+/)?.[0] || eNumberOrName.toUpperCase();

  if (ADDITIVES_DATABASE[cleanKey]) {
    return ADDITIVES_DATABASE[cleanKey];
  }

  // Generic Fallback Dossier for unlisted additives
  return {
    eNumber: cleanKey,
    name: eNumberOrName,
    category: 'Stabilizer',
    riskLevel: 'moderate',
    whoEfsaStatus: 'Registered food additive undergoing periodic EFSA safety review.',
    sideEffects: [
      'Industrial food processing ingredient',
      'May affect gut transit time or mucosal absorption in high concentrations',
    ],
    regulatoryRestrictions: {
      eu: 'Approved for food use under EU Regulation No 1333/2008.',
      usa: 'Regulated under FDA Code of Federal Regulations Title 21.',
    },
    summary: `Food additive registered under code ${cleanKey}. Evaluated for technological function in food preservation and texture.`,
  };
}
