// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PineconeClient } from '@pinecone-database/pinecone';
import * as Ably from 'ably';
import { CallbackManager } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { OpenAI } from 'langchain/llms';
import { PromptTemplate } from 'langchain/prompts';
import type { NextApiRequest, NextApiResponse } from 'next';
import { uuid } from 'uuidv4';
import { summarizeLongDocument } from './pages/api/summarizer';

import { ConversationLog } from './pages/api/conversationLog';
import { Metadata, getMatchesFromEmbeddings } from './pages/api/matches';
import { templates } from './pages/api/templates';

const llm = new OpenAI({});
let pinecone: PineconeClient | null = null;

const initPineconeClient = async () => {
  pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });

const handleRequest = async () => {
  if (!pinecone) {
    await initPineconeClient();
  }

  let summarizedCount = 0;

  try {
    const prompt = 'Write the smart contract for uniswap v3 pool';
    const userId = 'user';
    const channel = ably.channels.get(userId);
    const interactionId = uuid();

    // Retrieve the conversation log and save the user's prompt
    const conversationLog = new ConversationLog(userId);
    const conversationHistory = await conversationLog.getConversation({ limit: 10 });
    await conversationLog.addEntry({ entry: prompt, speaker: 'user' });

    // Build an LLM chain that will improve the user prompt
    const inquiryChain = new LLMChain({
      llm,
      prompt: new PromptTemplate({
        template: templates.inquiryTemplate,
        inputVariables: ['userPrompt', 'conversationHistory'],
      }),
    });
    const inquiryChainResult = await inquiryChain.call({ userPrompt: prompt, conversationHistory });
    const inquiry = inquiryChainResult.text;

    // Embed the user's intent and query the Pinecone index
    const embedder = new OpenAIEmbeddings();

    const embeddings = await embedder.embedQuery(inquiry);

    console.log('embeddings', embeddings.length);
    const matches = await getMatchesFromEmbeddings(embeddings, pinecone!, 3);

    console.log('matches', matches.length);

    // const urls = docs && Array.from(new Set(docs.map(doc => doc.metadata.url)))

    const urls =
      matches &&
      Array.from(
        new Set(
          matches.map((match) => {
            const metadata = match.metadata as Metadata;
            const { url } = metadata;
            return url;
          })
        )
      );

    console.log(urls);

    const fullDocuments =
      matches &&
      Array.from(
        matches.reduce((map, match) => {
          const metadata = match.metadata as Metadata;
          const { text, url } = metadata;
          if (!map.has(url)) {
            map.set(url, text);
          }
          return map;
        }, new Map())
      ).map(([_, text]) => text);

    const chunkedDocs =
      matches &&
      Array.from(
        new Set(
          matches.map((match) => {
            const metadata = match.metadata as Metadata;
            const { chunk } = metadata;
            return chunk;
          })
        )
      );

    // const fullDocuments = urls && await getDocumentsByUrl(urls)
    console.log(fullDocuments);

    const onSummaryDone = (summary: string) => {
      summarizedCount += 1;
    };

    const summary = await summarizeLongDocument(fullDocuments!.join('\n'), inquiry, onSummaryDone);
    console.log(summary);

    // Prepare a QA chain and call it with the document summaries and the user's prompt
    const promptTemplate = new PromptTemplate({
      //   template: templates.qaTemplate,
      template: templates.codeTemplate,
      inputVariables: ['inquiry', 'conversationHistory', 'framework_1', 'framework_2', 'framework_3', 'original_documents'],
      //   inputVariables: ['summaries', 'question', 'conversationHistory', 'urls'],
    });

    const chat = new ChatOpenAI({
      streaming: true,
      verbose: true,
      modelName: 'gpt-3.5-turbo',
      callbackManager: CallbackManager.fromHandlers({
        async handleLLMNewToken(token) {
          console.log(token);
          channel.publish({
            data: {
              event: 'response',
              token: token,
              interactionId,
            },
          });
        },
        async handleLLMEnd(result) {
          channel.publish({
            data: {
              event: 'responseEnd',
              token: 'END',
              interactionId,
            },
          });
        },
      }),
    });

    const chain = new LLMChain({
      prompt: promptTemplate,
      llm: chat,
    });

    await chain.call({
      //   summaries: summary,
      question: prompt,
      conversationHistory,
      framework_1: 'solidity',
      framework_2: 'typescript',
      framework_3: 'javascript',
      original_documents: fullDocuments,
    });
  } catch (error) {
    //@ts-ignore
    console.error(error);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { body } = req;
  const { prompt, userId } = body;
  await handleRequest();
  res.status(200).json({ message: 'started' });
}
