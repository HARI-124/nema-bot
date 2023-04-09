export enum ContentType {
  IMAGE = 'image',
  PDF_DOCUMENT = 'pdf_document',
  ARTICLE = 'article',
  DISCOURSE = 'discourse',
  GITBOOK = 'gitbook',
  GITHUB = 'github',
}

export interface Content {
  id: string;
  type: ContentType;
  url: string;
}

export interface WebArticle extends Content {
  type: ContentType.ARTICLE;
  xpath: string;
}

const uniswapArticles: WebArticle[] = [
  {
    id: 'uniswap-impermanent-loss-whiteboardcrypto',
    url: 'https://whiteboardcrypto.com/impermanent-loss-calculator',
    xpath: '/html/body/div[1]/div/div[1]/div[2]/div[2]/section/div[1]',
    type: ContentType.ARTICLE,
  },
  {
    id: 'uniswap-impermanent-loss-chainbulletin',
    url: 'https://chainbulletin.com/impermanent-loss-explained-with-examples-math',
    xpath: '/html/body/div[1]/div/div/div[2]',
    type: ContentType.ARTICLE,
  },
  // other
  {
    id: 'uniswap-impermanent-loss-blockworks',
    url: 'https://blockworks.co/news/the-investors-guide-to-navigating-impermanent-loss',
    xpath: '/html/body/div[1]/div/main/section[1]/div[1]/article/div[3]',
    type: ContentType.ARTICLE,
  },
  {
    id: 'uniswap-impermanent-loss-ledger',
    url: 'https://www.ledger.com/academy/glossary/impermanent-loss',
    xpath: '/html/body/main/div/div',
    type: ContentType.ARTICLE,
  },
  {
    id: 'uniswap-impermanent-loss-coinmonks-medium',
    url: 'https://medium.com/coinmonks/understanding-impermanent-loss-9ac6795e5baa',
    xpath: '/html/body/div[1]/div/div[3]/div[2]/div/main/div/div[3]/div/div/article/div/div[2]/section/div/div[2]',
    type: ContentType.ARTICLE,
  },
];

const uniswapContents: Content[] = [...uniswapArticles];
