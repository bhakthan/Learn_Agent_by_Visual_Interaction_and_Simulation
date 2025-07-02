import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useFlowColors, FlowColorType } from '@/lib/hooks/useFlowColors';
import { Palette } from '@phosphor-icons/react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
  <div className="flex items-center gap-2">
    <Label htmlFor={`color-${label}`} className="w-24 text-sm">{label}</Label>
    <div className="flex items-center gap-2">
      <input
        id={`color-${label}`}
        type="color"
        value={value.startsWith('rgba') 
          ? rgbaToHex(value) 
          : value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 rounded cursor-pointer"
      />
      <span className="text-xs text-muted-foreground">
        {value.startsWith('rgba') ? value : value}
      </span>
    </div>
  </div>
);

// Helper function to convert rgba to hex
function rgbaToHex(rgba: string): string {
  // Parse rgba values
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  // Convert to hex
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha = 0.9): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Component that allows customization of flow colors in visualizations
 * @param {Object} props - Component properties
 * @param {Function} props.onColorsChange - Callback when colors change
 */
const FlowColorCustomizer = ({ 
  onColorsChange 
}: { 
  onColorsChange?: (colorMap: Record<string, any>) => void 
}) => {
  const { colorMap, updateFlowColor, resetColors, defaultColors } = useFlowColors();
  
  // Flow types for customization
  const flowTypes: Array<{ type: FlowColorType; label: string }> = [
    { type: 'query', label: 'Query' },
    { type: 'response', label: 'Response' },
    { type: 'tool_call', label: 'Tool Call' },
    { type: 'observation', label: 'Observation' },
    { type: 'reflection', label: 'Reflection' },
    { type: 'plan', label: 'Plan' },
    { type: 'message', label: 'Message' },
    { type: 'data', label: 'Data' },
    { type: 'error', label: 'Error' },
  ];
  
  // Update color and notify parent component
  const handleColorChange = (type: FlowColorType, color: string) => {
    // Convert hex to rgba
    const rgbaColor = hexToRgba(color);
    updateFlowColor(type, { color: rgbaColor });
    
    if (onColorsChange) {
      onColorsChange({ ...colorMap, [type]: { ...colorMap[type], color: rgbaColor } });
    }
  };
  
  // Reset colors to defaults
  const handleReset = () => {
    resetColors();
    if (onColorsChange) {
      onColorsChange(defaultColors);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Palette size={20} />
          Flow Color Customizer
        </CardTitle>
        <CardDescription>
          Customize the colors used for different types of data flows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="all" className="flex-1">All Types</TabsTrigger>
            <TabsTrigger value="grouped" className="flex-1">By Category</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            {flowTypes.map(({ type, label }) => (
              <ColorPicker 
                key={type}
                label={label}
                value={colorMap[type]?.color || defaultColors[type].color}
                onChange={(color) => handleColorChange(type, color)}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="grouped" className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Input/Output</h4>
              <ColorPicker 
                label="Query"
                value={colorMap.query?.color || defaultColors.query.color}
                onChange={(color) => handleColorChange('query', color)}
              />
              <ColorPicker 
                label="Response"
                value={colorMap.response?.color || defaultColors.response.color}
                onChange={(color) => handleColorChange('response', color)}
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Processing</h4>
              <ColorPicker 
                label="Tool Call"
                value={colorMap.tool_call?.color || defaultColors.tool_call.color}
                onChange={(color) => handleColorChange('tool_call', color)}
              />
              <ColorPicker 
                label="Observation"
                value={colorMap.observation?.color || defaultColors.observation.color}
                onChange={(color) => handleColorChange('observation', color)}
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Cognitive</h4>
              <ColorPicker 
                label="Reflection"
                value={colorMap.reflection?.color || defaultColors.reflection.color}
                onChange={(color) => handleColorChange('reflection', color)}
              />
              <ColorPicker 
                label="Plan"
                value={colorMap.plan?.color || defaultColors.plan.color}
                onChange={(color) => handleColorChange('plan', color)}
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Others</h4>
              <ColorPicker 
                label="Message"
                value={colorMap.message?.color || defaultColors.message.color}
                onChange={(color) => handleColorChange('message', color)}
              />
              <ColorPicker 
                label="Data"
                value={colorMap.data?.color || defaultColors.data.color}
                onChange={(color) => handleColorChange('data', color)}
              />
              <ColorPicker 
                label="Error"
                value={colorMap.error?.color || defaultColors.error.color}
                onChange={(color) => handleColorChange('error', color)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlowColorCustomizer;