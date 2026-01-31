import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

interface AIReviewSummaryProps {
  vendorName: string;
}

export default function AIReviewSummary({ vendorName }: AIReviewSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI review summarization
    const generateSummary = () => {
      setIsLoading(true);

      // Mock AI-generated summary
      setTimeout(() => {
        setSummary(
          'Customers consistently praise the authentic flavors and generous portions. The vendor is known for maintaining high hygiene standards and providing quick, friendly service. Many reviewers highlight the excellent value for money and recommend trying the signature dishes.'
        );
        setHighlights([
          'Authentic and delicious flavors',
          'Excellent hygiene and cleanliness',
          'Friendly and efficient service',
          'Great value for money',
          'Generous portion sizes',
        ]);
        setIsLoading(false);
      }, 1200);
    };

    generateSummary();
  }, [vendorName]);

  if (isLoading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-950 dark:to-purple-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-purple-900 dark:text-purple-100">AI Review Highlights</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1 border-purple-300 dark:border-purple-700">
              <SiGoogle className="h-3 w-3" />
              <span className="text-xs">Powered by Google AI</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-purple-800 dark:text-purple-200">Analyzing reviews...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-950 dark:to-purple-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-purple-900 dark:text-purple-100">AI Review Highlights</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1 border-purple-300 dark:border-purple-700">
            <SiGoogle className="h-3 w-3" />
            <span className="text-xs">Powered by Google AI</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-white/50 p-4 dark:bg-purple-900/30">
          <p className="text-sm leading-relaxed text-purple-900 dark:text-purple-100">{summary}</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Key Highlights:</h4>
          <div className="space-y-2">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                <span className="text-sm text-purple-800 dark:text-purple-200">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-purple-700 dark:text-purple-300">
          Summary generated from customer reviews using Google Gemini AI
        </p>
      </CardContent>
    </Card>
  );
}
