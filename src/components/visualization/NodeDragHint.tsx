import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { Badge } from '@/components/ui/badge';

interface NodeDragHintProps {
  initialShow?: boolean;
}

const NodeDragHint = ({ initialShow = false }: NodeDragHintProps) => {
  const [show, setShow] = useState(false); // Always initialize to false regardless of initialShow

  // No auto-show functionality
  useEffect(() => {
    // No timeout needed as we never show the hint
    return () => {}; // Empty cleanup function
  }, [show]);

  if (!show) return null;

  return (
    <Card className="z-50 absolute top-4 left-1/2 transform -translate-x-1/2 animate-fade-in">
      <CardContent className="p-3 flex items-center gap-3">
        <div>
          <DragHandleDots2Icon className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Nodes are now <Badge variant="outline">draggable</Badge> - Click and drag to rearrange!
          </p>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShow(false)}>
          Dismiss
        </button>
      </CardContent>
    </Card>
  );
};

export default NodeDragHint;
