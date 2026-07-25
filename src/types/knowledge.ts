/** Knowledge base document */
export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  title: string;
  type: 'pdf' | 'website' | 'faq' | 'text';
  sourceUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  embeddingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

/** FAQ item */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

/** Knowledge base */
export interface KnowledgeBase {
  id: string;
  name: string;
  tenantId: string;
  documentCount: number;
  faqCount: number;
  totalChunks: number;
  status: 'ready' | 'indexing' | 'error';
  createdAt: string;
  updatedAt: string;
}
