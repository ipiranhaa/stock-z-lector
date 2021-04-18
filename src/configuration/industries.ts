export type Industry =
  | 'AGRO'
  | 'CONSUMP'
  | 'FINCIAL'
  | 'INDUS'
  | 'PROPCON'
  | 'RESOURC'
  | 'SERVICE'
  | 'TECH'

export const industries = {
  AGRO: 'Agro & Food Industry',
  CONSUMP: 'Consumer Products',
  FINCIAL: 'Financials',
  INDUS: 'Industrials',
  PROPCON: 'Property & Construction',
  RESOURC: 'Resources',
  SERVICE: 'Services',
  TECH: 'Technology',
}

export const sectors = {
  AGRI: 'Agribusiness',
  FOOD: 'Food & Beverage',
  FASHION: 'Fashion',
  HOME: 'Home & Office Products',
  PERSON: 'Personal Products & Pharmaceuticals',
  BANK: 'Banking',
  FIN: 'Finance & Securities',
  INSUR: 'Insurance',
  AUTO: 'Automotive',
  IMM: 'Industrial Materials & Machine',
  PAPER: 'Paper & Printing Materials',
  PETRO: 'Petrochemicals & Chemicals',
  PKG: 'Packaging',
  STEEL: 'Steel',
  CONMAT: 'Construction Materials',
  PROP: 'Property Development',
  PF: 'Property Fund & Real Extate Investment Trusts',
  CONS: 'Construction Services',
  ENERG: 'Energy & Utilities',
  MINE: 'Mining',
  COMM: 'Commerce',
  HELTH: 'Health Care Services',
  MEDIA: 'Media & Publishing',
  PROF: 'Professional Services',
  TOURISM: 'Tourisms & Leisure',
  TRANS: 'Transportation & Logistics',
  ETRON: 'Electronic Components',
  ICT: 'Information & Communication Technology',
}

export const relations = {
  AGRO: ['AGRI', 'FOOD'],
  CONSUMP: ['FASHION', 'HOME', 'PERSON'],
  FINCIAL: ['BANK', 'FIN', 'INSUR'],
  INDUS: ['AUTO', 'IMM', 'PAPER', 'PETRO', 'PKG', 'STEEL'],
  PROPCON: ['CONMAT', 'PROP', 'PF', 'CONS'],
  RESOURC: ['ENERG', 'MINE'],
  SERVICE: ['COMM', 'HELTH', 'MEDIA', 'PROF', 'TOURISM', 'TRANS'],
  TECH: ['ETRON', 'ICT'],
}
