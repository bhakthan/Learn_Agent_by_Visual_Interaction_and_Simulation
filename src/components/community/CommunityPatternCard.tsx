import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  User, 
  Clock, 
  ArrowRight
} from '@phosphor-icons/react';

interface CommunityPatternCardProps {
  title: string;
  author: string;
  description: string;
  tags: string[];
  stars: number;
  lastUpdated: string;
}

const CommunityPatternCard: React.FC<CommunityPatternCardProps> = ({
  title,
  author,
  description,
  tags,
  stars,
  lastUpdated
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <User size={14} className="mr-1" /> 
          {author}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-primary/10 hover:bg-primary/20">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="flex items-center mr-3">
            <Star size={14} className="mr-1 text-amber-400" weight="fill" /> 
            {stars}
          </span>
          
          <span className="flex items-center">
            <Clock size={14} className="mr-1" /> 
            {lastUpdated}
          </span>
        </div>
        
        <Button variant="ghost" size="sm" className="text-xs gap-1">
          View <ArrowRight size={14} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommunityPatternCard;