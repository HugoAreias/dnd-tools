const PC_XP = {
  'Easy': {
    1: 25,
    2: 50,
    3: 75,
    4: 125,
    5: 250,
    6: 300,
    7: 350,
    8: 450,
    9: 550,
    10: 600,
    11: 800,
    12: 1000,
    13: 1100,
    14: 1250,
    15: 1400,
    16: 1600,
    17: 2000,
    18: 2100,
    19: 2400,
    20: 2800,
  },
  'Medium': {
    1: 50,
    2: 100,
    3: 150,
    4: 250,
    5: 500,
    6: 600,
    7: 750,
    8: 900,
    9: 1100,
    10: 1200,
    11: 1600,
    12: 2000,
    13: 2200,
    14: 2500,
    15: 2800,
    16: 3200,
    17: 3900,
    18: 4200,
    19: 4900,
    20: 5700,
  },
  'Hard': {
    1: 75,
    2: 150,
    3: 225,
    4: 375,
    5: 750,
    6: 900,
    7: 1100,
    8: 1400,
    9: 1600,
    10: 1900,
    11: 2400,
    12: 3000,
    13: 3400,
    14: 3800,
    15: 4300,
    16: 4800,
    17: 5900,
    18: 6300,
    19: 7300,
    20: 8500,
  },
  'Deadly': {
    1: 100,
    2: 200,
    3: 400,
    4: 500,
    5: 1100,
    6: 1400,
    7: 1700,
    8: 2100,
    9: 2400,
    10: 2800,
    11: 3600,
    12: 4500,
    13: 5100,
    14: 5700,
    15: 6400,
    16: 7200,
    17: 8800,
    18: 9500,
    19: 10900,
    20: 12700,
  },
}

const CR_XP = {
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
}

const ENCOUNTER_FACTOR = {
  'Trivial': 20,
  'Easy': 12,
  'Medium': 8,
  'Hard': 6,
  'Deadly': 3,
}

const ENCOUNTER_RATINGS = ['Easy', 'Medium', 'Hard', 'Deadly']
const MULTIPLIERS_TIER = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5]
const MIN_PARTY = 3
const MAX_PARTY = 5
const EPIC_LEVEL = 20
const MAX_CR = 30

function calculate_pc_xp_threshold(pc_level_qt) {
  let total_pcs = 0
  let total_pc_xp = {
    'Easy': 0,
    'Medium': 0,
    'Hard': 0,
    'Deadly': 0,
  }

  Object.keys(pc_level_qt).forEach(function(key) {
    if (key > EPIC_LEVEL) return

    for (const rating of ENCOUNTER_RATINGS) {
      total_pc_xp[rating] += PC_XP[rating][key] * pc_level_qt[key]
    }

    total_pcs += pc_level_qt[key]
  })

  return [total_pc_xp, total_pcs]
}

function calculate_total_cr_xp(cr_qt) {
  let total_cr_xp = 0
  let total_creatures = 0

  Object.keys(cr_qt).forEach(function(key) {
    if (key > MAX_CR) return

    total_cr_xp += CR_XP[key] * cr_qt[key]
    total_creatures += cr_qt[key]
  })

  return [total_cr_xp, total_creatures]
}

function calculate_multiplier(total_pcs, total_creatures) {
  let tier = 0

  switch (total_creatures) {
    case 1:
      tier = 1
      break
    case 2:
      tier = 2
      break
    case 3:
    case 4:
    case 5:
    case 6:
      tier = 3
      break
    case 7:
    case 8:
    case 9:
    case 10:
      tier = 4
      break
    case 11:
    case 12:
    case 13:
    case 14:
      tier = 5
      break
    default:
      tier = 6
  }

  if (total_pcs < MIN_PARTY) ++tier
  if (total_pcs > MAX_PARTY) --tier

  return MULTIPLIERS_TIER[tier]
}

function get_difficulty_rating(total_pc_xp, total_cr_xp) {
  let difficulty_rating = 'Trivial'

  for (const rating of ENCOUNTER_RATINGS) {
    if (total_pc_xp[rating] >= total_cr_xp) break
    difficulty_rating = rating
  }

  return difficulty_rating
}

function calculate_encounter_level(total_cr_xp) {
  let encounter_level = 0

  sorted_cr = Object.keys(CR_XP).sort((a, b) => (a - b))

  for (const cr of sorted_cr) {
    if (CR_XP[cr] <= total_cr_xp) encounter_level = cr
  }

  return encounter_level
}

function output_results(results) {
  console.log('Number of PCs:', results['total_pcs'])
  console.log('Number of Monsters:', results['total_creatures'])
  console.log('Number of Encounters/Day:', results['encounter_day'])
  console.log('Encounter Multiplier:', results['multiplier'])
  console.log("Party's XP Threshold:", results['total_pc_xp'])
  console.log("Initial Monsters' XP:", results['total_cr_xp'])
  console.log("Monsters' XP (with multiplier):", results['multiplier_cr_xp'])
  console.log("Monsters' XP (factoring encounters/day):", results['factored_cr_xp'])
  console.log('Encounter Level:', results['encounter_level'])
  console.log('Difficulty Rating:', results['difficulty_rating'])
}

function main(pc_level_qt, cr_qt, encounter_day) {
  const [total_pc_xp, total_pcs] = calculate_pc_xp_threshold(pc_level_qt)
  const [total_cr_xp, total_creatures] = calculate_total_cr_xp(cr_qt)

  if (!total_pcs || !total_creatures) return

  const multiplier = calculate_multiplier(total_pcs, total_creatures)
  const multiplier_cr_xp = total_cr_xp * multiplier
  let difficulty_rating = get_difficulty_rating(total_pc_xp, multiplier_cr_xp)
  const factored_cr_xp = multiplier_cr_xp * (encounter_day / ENCOUNTER_FACTOR[difficulty_rating])
  difficulty_rating = get_difficulty_rating(total_pc_xp, factored_cr_xp)
  const encounter_level = calculate_encounter_level(factored_cr_xp)

  output_results({
    difficulty_rating,
    encounter_day,
    encounter_level,
    factored_cr_xp,
    multiplier,
    multiplier_cr_xp,
    total_creatures,
    total_cr_xp,
    total_pcs,
    total_pc_xp,
  })
}

// change these for the number of PCs (PC level: number of PCs)
let pc_level_qt = {
  4: 4,
  5: 4,
}

// change these for the monsters (CR: quantity) (e.g.: 0.5: 3 or 0.125: 4)
let cr_qt = {
  2: 2,
  4: 2,
  6: 1,
  7: 2,
}

// number of encounters expected per day
let encounter_day = 4

main(pc_level_qt, cr_qt, encounter_day)
