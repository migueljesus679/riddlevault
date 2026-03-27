import { Card, Badge } from '../ui';

interface AnalysisResultProps {
  doc: {
    filename: string;
    type: string;
    size: number;
    processing: Record<string, unknown>;
    analysis: {
      summary?: string;
      keywords?: string[];
      entities?: Record<string, string[]>;
      word_count?: number;
      sentence_count?: number;
    };
    createdAt?: string;
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AnalysisResult({ doc }: AnalysisResultProps) {
  const { analysis } = doc;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-cinzel text-lg text-gold">{doc.filename}</h3>
          <div className="flex gap-2 mt-1">
            <Badge>{doc.type.toUpperCase()}</Badge>
            <Badge variant="default">{formatSize(doc.size)}</Badge>
            {analysis.word_count && <Badge variant="default">{analysis.word_count} palavras</Badge>}
          </div>
        </div>
        {doc.createdAt && (
          <span className="font-crimson text-xs text-mithril/40">
            {new Date(doc.createdAt).toLocaleDateString('pt-PT')}
          </span>
        )}
      </div>

      {analysis.summary && (
        <div>
          <h4 className="font-cinzel text-sm text-gold/80 mb-1">Resumo</h4>
          <p className="font-crimson text-parchment/80 text-sm leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {analysis.keywords && analysis.keywords.length > 0 && (
        <div>
          <h4 className="font-cinzel text-sm text-gold/80 mb-1">Palavras-chave</h4>
          <div className="flex gap-1.5 flex-wrap">
            {analysis.keywords.map(k => <Badge key={k} variant="success">{k}</Badge>)}
          </div>
        </div>
      )}

      {analysis.entities && Object.keys(analysis.entities).length > 0 && (
        <div>
          <h4 className="font-cinzel text-sm text-gold/80 mb-1">Entidades</h4>
          {Object.entries(analysis.entities).map(([type, values]) => (
            <div key={type} className="mb-2">
              <span className="font-crimson text-xs text-mithril/60 capitalize">{type}:</span>
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                {values.slice(0, 10).map((v, i) => <Badge key={i} variant="warning">{v}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
