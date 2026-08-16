import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AddSlideButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddSlideButton({
  onClick,
  disabled,
}: AddSlideButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full"
      onClick={onClick}
      disabled={disabled}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add slide
    </Button>
  );
}